const { MessageEmbed } = require("discord.js");
const config = require("../../config.json");
const moment = require('moment');
const { off } = require("npm");
require("moment-duration-format");

module.exports.run = async (bot, message, args, idioma) => {
  const { channel } = message.member.voice;
  const eucanal = message.guild.me.voice.channel
  if(!channel) return message.reply(idioma.play.conectar);
  if(!args.length) return message.reply(idioma.play.nada);
  if(eucanal && eucanal.id !== channel.id && !channel.joinable) return message.reply(idioma.play.semPerm)
  
  const player = message.client.manager.create({
    guild: message.guild.id,
    voiceChannel: channel.id,
    textChannel: message.channel.id,
    selfDeafen: true,
    bassboost: false
  });

    player.connect();

  const search = args.join(' ');
    let res;


    try {
      res = await player.search(search, message.author);
      if (res.loadType === 'LOAD_FAILED') {
        if (!player.queue.current) player.destroy();
        throw new Error(res.exception.message);
      }
    } catch (err) {
      return message.reply(idioma.play.error + err.message);
    }

    switch (res.loadType) {
      case 'NO_MATCHES':
        if (!player.queue.current) player.destroy();
        return message.reply(idioma.play.semResultado);
      case 'TRACK_LOADED':
        player.queue.add(res.tracks[0]);

        let embed1 = new MessageEmbed()
        embed1.setTimestamp()
        embed1.setColor(config.color)
        embed1.setDescription(`${idioma.play.adicionado} \`${res.tracks[0].title}\`\n${idioma.play.duracao} \`${moment.duration(res.tracks[0].duration).format("d:hh:mm:ss")}\``)
        embed1.setFooter(idioma.play.solicitado + res.tracks[0].requester.tag, `${res.tracks[0].requester.avatarURL({ dynamic: true, size: 2048 })}`)
        if(!player.playing && !player.paused && !player.queue.length) player.play();
        return message.channel.send(embed1);

        case 'PLAYLIST_LOADED':
          player.queue.add(res.tracks);
          if(!player.playing && !player.paused && player.queue.size === res.tracks.length) player.play();


          let embed2 = new MessageEmbed()
          embed2.setTimestamp()
          embed2.setColor(config.color)
          embed2.setDescription(`${idioma.play.playlist} \`${res.playlist.name}\` ${idioma.play.com} \`${res.tracks.length}\` ${idioma.play.musicas}\n${idioma.play.duracao} \`${moment.duration(res.playlist.duration).format("d:hh:mm:ss")}\``)
          if(!player.playing && !player.paused && player.queue.size === res.tracks.length) player.play();
          return message.channel.send(embed2);

          case 'SEARCH_RESULT':
            let max = 5, collected, filter = (m) => m.author.id === message.author.id && /^(\d+|cancelar)$/i.test(m.content) || message.author.id && /^(\d+|cancel)$/i.test(m.content);
            if(res.tracks.length < max) max = res.tracks.length;

            const results = res.tracks
            .slice(0, max)
            .map((track, index) => `${++index} - \`${track.title}\``)
            .join('\n');
            
            const embed = new MessageEmbed()
            .setColor(config.color)
            .setTimestamp()
            .addFields(
              { name: idioma.play.cancelar1, value: idioma.play.cancelar2 }
            )
            .setDescription(results)
            message.channel.send(embed);

            try {
              collected = await message.channel.awaitMessages(filter, { max: 1, time: 30e3, errors: ['time'] });
            } catch (e) {
              if (!player.queue.current) player.destroy();
              return message.reply(idioma.play.acabouTempo);
            }

            const first = collected.first().content;

            if (first.toLowerCase() === 'cancelar' || first.toLowerCase() === 'cancel') {
              if (!player.queue.current) player.destroy();
              return message.channel.send(idioma.play.cancelado);
            }
            
            const index = Number(first) - 1;
        if (index < 0 || index > max - 1) return message.reply(idioma.play.numeroInvalido + max + ')');

        const track = res.tracks[index];
        player.queue.add(track);
        
        let embed3 = new MessageEmbed()
        embed3.setColor(config.color)
        embed3.setFooter(`${idioma.play.solicitado} ${track.requester.tag}`, `${track.requester.avatarURL({ dynamic: true, size: 2048 })}`)
        embed3.setDescription(`${idioma.play.adicionado} \`${track.title}\` \n ${idioma.play.duracao} \`${moment.duration(track.duration).format("d:hh:mm:ss")}\``)
        if (!player.playing && !player.paused && !player.queue.length) player.play();
        return message.channel.send(embed3);
      }
    };



exports.conf = {
        enabled: true,
        guildOnly: true,
        aliase: ["tocar", "p", "search"]
}
exports.help = {
        nome: "play",
        descrição: "Toca uma música",
        uso: "play <MUSGA>",
        categoria: "Música"
}

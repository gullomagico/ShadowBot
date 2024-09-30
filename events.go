package main

import (
	"fmt"
	"math/rand"
	"regexp"

	"github.com/bwmarrin/discordgo"
	"github.com/charmbracelet/log"
)

var generatedVoiceChannels = []string{
	"🔮 Dalaran 🔮",
	"🐗 Orgrimmar 🐗",
	"⚡ Thunder Bluff ⚡",
	"💀 Undercity 💀",
	"🩸 Silvermoon City 🩸",
	"🌠 Shattrath City 🌠",
	"🔸 Argent Tournament 🔸",
	"🔸 Camp Winterhoof 🔸",
	"🔸 New Agamand 🔸",
	"🔸 The Bulwark 🔸",
	"🔸 Warsong Hold 🔸",
	"🔸 Bor'gorok Outpost 🔸",
	"🔸 Taunka'le Village 🔸",
	"🔸 Vengeance Landing 🔸",
	"🔸 Apothecary Camp 🔸",
	"🔸 Venomspite 🔸",
	"🔸 Agmar's Hammer 🔸",
	"🔸 Kor'kron Vanguard 🔸",
	"🔸 Conquest Hold 🔸",
	"🔸 Camp Oneqwah 🔸",
	"🔸 Sunreaver's Command 🔸",
	"🔸 Warsong Camp 🔸",
	"🔸 Grom'arsh Crash-Site 🔸",
	"🔸 Camp Tunka'lo 🔸",
}

func messageCreate(s *discordgo.Session, m *discordgo.MessageCreate) {

	if m.Author.ID == s.State.User.ID {
		return
	}

	if m.Content == "ping" {
		s.ChannelMessageSend(m.ChannelID, "Pong!")
	}

	if m.Content == "pong" {
		s.ChannelMessageSend(m.ChannelID, "Ping!")
	}
}

func voiceStateUpdate(s *discordgo.Session, m *discordgo.VoiceStateUpdate) {
    user, err := s.User(m.UserID)
    if err != nil {
        log.Error("error getting user,", "err", err)
        return
    }

    switch {
		case m.BeforeUpdate == nil && m.ChannelID != "":
			channel, err := s.Channel(m.ChannelID)
			if err != nil {
				log.Error("error getting channel,", "err", err)
				return
			}

			log.Debug(fmt.Sprintf("\"%s\" has joined the channel \"%s\"", user.Username, channel.Name))
			handleUserJoinedChannel(s, channel, user)
		
		case m.ChannelID == "" && m.BeforeUpdate != nil:
			channel, err := s.Channel(m.BeforeUpdate.ChannelID)
			if err != nil {
				log.Error("error getting channel,", "err", err)
				return
			}

			log.Debug(fmt.Sprintf("\"%s\" has left the channel \"%s\"", user.Username, channel.Name))
			handleUserLeftChannel(s, channel, user)
		
		case m.BeforeUpdate != nil && m.ChannelID != m.BeforeUpdate.ChannelID:
			oldChannel, err := s.Channel(m.BeforeUpdate.ChannelID)
			if err != nil {
				log.Error("error getting channel,", "err", err)
				return
			}

			newChannel, err := s.Channel(m.ChannelID)
			if err != nil {
				log.Error("error getting channel,", "err", err)
				return
			}

			log.Debug(fmt.Sprintf("\"%s\" changed channel from \"%s\" to \"%s\"", user.Username, oldChannel.Name, newChannel.Name))
			
			handleUserLeftChannel(s, oldChannel, user)
			
			handleUserJoinedChannel(s, newChannel, user)

		case m.ChannelID == m.BeforeUpdate.ChannelID:
			if m.SelfMute != m.BeforeUpdate.SelfMute {
				if m.SelfMute {
					log.Debug(fmt.Sprintf("%s turned mute on", user.Username))
				} else {
					log.Debug(fmt.Sprintf("%s turned mute off", user.Username))
				}
			}
			if m.SelfDeaf != m.BeforeUpdate.SelfDeaf {
				if m.SelfDeaf {
					log.Debug(fmt.Sprintf("%s turned deaf on", user.Username))
				} else {
					log.Debug(fmt.Sprintf("%s turned deaf off", user.Username))
				}
			}
    }
}

func handleUserJoinedChannel(s *discordgo.Session, channel *discordgo.Channel, user *discordgo.User) {
	trigger, err := regexp.Match("^\u2795", []byte(channel.Name))
	if err != nil {
		log.Error("error matching trigger,", "err", err)
		return
	}

	if trigger {
		log.Debug("trigger found for create channel")

		var parentID string
        if channel.ParentID != "" {
            parentID = channel.ParentID
        } else {
            log.Warn("The channel does not belong to a category.")
        }

        s.GuildChannelCreateComplex(channel.GuildID, discordgo.GuildChannelCreateData{
            Name:     generatedVoiceChannels[rand.Intn(len(generatedVoiceChannels))],
            Type:     discordgo.ChannelTypeGuildVoice,
            ParentID: parentID,
            PermissionOverwrites: channel.PermissionOverwrites,
        })
	}
}

func handleUserLeftChannel(s *discordgo.Session, channel *discordgo.Channel, user *discordgo.User) {

}
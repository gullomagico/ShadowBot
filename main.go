package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"shadowbot/utils"
	"syscall"

	"github.com/bwmarrin/discordgo"
	"github.com/charmbracelet/log"
)

var (
	EnvFile  string
	LogLevel string

	DiscordToken string
)

func init() {
	envFile := flag.String("env", "", "Path to env file")
	LogLevel := flag.String("log", "", "Log level (debug, info, warn, error, fatal). Default: info")
	flag.Parse()

	utils.LoadSecrets(envFile)

	DiscordToken = os.Getenv("DISCORD_TOKEN")

	utils.InitLogger(*LogLevel)
}

func main() {
	dg, err := discordgo.New("Bot " + DiscordToken)
	if err != nil {
		log.Fatal("error creating Discord session,", "err", err)
		return
	}

	dg.AddHandler(func(s *discordgo.Session, event *discordgo.Ready) {
		log.Info(fmt.Sprintf("Logged in as: %v#%v", s.State.User.Username, s.State.User.Discriminator))
	})

	dg.AddHandler(utils.MessageCreate)
	dg.AddHandler(utils.VoiceStateUpdate)
	dg.AddHandler(utils.InteractionCreate)

	dg.Identify.Intents = discordgo.IntentsGuildMessages | discordgo.IntentsGuilds | discordgo.IntentsGuildVoiceStates

	err = dg.Open()
	if err != nil {
		log.Error("error opening connection,", err)
		return
	}
	defer dg.Close()

	log.Info("Loading commands...")
	registeredCommands := make([]*discordgo.ApplicationCommand, len(utils.Commands))
	for i, v := range utils.Commands {
		cmd, err := dg.ApplicationCommandCreate(dg.State.User.ID, "", v)
		if err != nil {
			log.Fatal("Cannot create '%v' command: %v", v.Name, err)
		}
		registeredCommands[i] = cmd
	}

	// Wait here until CTRL-C or other term signal is received.
	log.Info("Bot is now running.  Press CTRL-C to exit.")
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-sc
}

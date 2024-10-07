package utils

import (
	"github.com/charmbracelet/log"
)

func InitLogger(logLevel string) {
	level, err := log.ParseLevel(string(logLevel))
	if err != nil {
		log.Info("Invalid log level. Defaulting to info")
		logLevel = "info"
	}

	log.SetLevel(level)
	log.SetTimeFormat("2006-01-02 15:04:05.000")
}

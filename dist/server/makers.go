package main

import (
	"net/http"

	"github.com/dutchcoders/slack"
)

func apiMakersAll(w http.ResponseWriter, r *http.Request) {
	makers := []slack.User{}

	for _, maker := range cache.Makers() {
		switch {
		case maker.Deleted:
			fallthrough
		case maker.IsBot:
			fallthrough
		case maker.Profile.ImageOriginal == "":
			continue
		}

		truncated_maker := slack.User{
			Id: maker.Id,
			Profile: slack.UserProfile{
				Image192: maker.Profile.Image192,
			},
		}
		makers = append(makers, truncated_maker)
	}

	WriteJSON(w, makers)
}

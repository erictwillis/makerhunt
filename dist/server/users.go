package main

import (
	"log"
	"net/http"
	"strings"

	"github.com/kyeah/gohunt/gohunt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func apiUsersNew(w http.ResponseWriter, r *http.Request) {
	username := "twitterapi"

	// find user with username
	var user User
	if err := db.Users.Find(bson.M{"username": username}).One(&user); err == nil {
		WriteJSON(w, user)
		return
	} else if err != mgo.ErrNotFound {
		http.Error(w, err.Error(), 500)
		return
	}

	user = User{UserId: bson.NewObjectId()}
	// parse json input

	// get twitter data
	err := func() error {
		client, err := NewTwitterClient()
		if err != nil {
			return err
		}

		if err = client.Show(&user.Twitter, username); err != nil {
			return err
		}

		return nil
	}()

	if err != nil {
	}

	// get product hunt data
	err = func() error {
		client, err := gohunt.NewUserOAuthClient(config.ClientId, config.ClientSecret, config.RedirectUrl, r.FormValue("code"))
		if err != nil {
			return err
		}

		//
		u, err := client.GetUser(username)
		if err != nil {
			return err
		}

		user.PHSettings.ID = u.ID
		user.PHSettings.Name = u.Name
		user.PHSettings.Headline = u.Headline
		user.PHSettings.Created = u.Created
		user.PHSettings.ImageUrl = u.Image
		user.PHSettings.ProfileUrl = u.ProfileUrl
		user.PHSettings.WebsiteUrl = u.WebsiteUrl

		return nil
	}()

	if err != nil {
	}

	for k, imageUrl := range user.ImageUrl {
		user.ImageUrl[k] = strings.Replace(imageUrl, "http://", "https://", -1)
	}

	err = db.Users.Insert(&user)
	if err != nil {
		log.Fatal(err)
	}

	WriteJSON(w, user)
}

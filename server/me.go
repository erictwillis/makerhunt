package main

import (
	"log"
	"net/http"

	"github.com/kyeah/gohunt/gohunt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func apiMeGet(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, config.SessionName)

	userid := session.Values["userid"]
	if userid == nil {
		http.Error(w, "Unauthorized", 401)
		return
	}

	var maker gohunt.User
	if err := db.Makers.Find(bson.M{"id": userid}).One(&maker); err == mgo.ErrNotFound {
		http.NotFound(w, r)
		return
	} else if err != nil {
		panic(err)
	}

	log.Printf("Userid %s", maker)

	WriteJSON(w, maker)
}

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"

	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func apiEventGet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	if id, ok := vars["id"]; ok {
		event := Event{}
		id := bson.ObjectIdHex(id)
		err := db.Events.FindId(id).One(&event)
		if err != nil {
			panic(err)
		}

		WriteJSON(w, event)
	} else {
		http.Error(w, "Error", 500)
		return
	}
}

func apiEventUpdate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	if id, ok := vars["id"]; ok {
		event := Event{}
		id := bson.ObjectIdHex(id)
		err := db.Events.UpdateId(id, event)
		if err != nil {
			log.Fatal(err)
		}

		WriteJSON(w, event)
	} else {
		http.Error(w, "Missing id parameter.", 422)
		return
	}
}

func apiEventDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	if id, ok := vars["id"]; ok {
		id := bson.ObjectIdHex(id)
		if err := db.Events.RemoveId(id); err == mgo.ErrNotFound {
			http.NotFound(w, r)
			return
		} else if err != nil {
			panic(err)
		}

		WriteJSON(w, id)
	} else {
		http.Error(w, "Missing id parameter.", 422)
		return
	}
}

func apiEventPatch(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	if id, ok := vars["id"]; ok {
		event := Event{}
		id := bson.ObjectIdHex(id)
		if err := db.Events.FindId(id).One(&event); err == mgo.ErrNotFound {
			http.NotFound(w, r)
			return
		} else if err != nil {
			panic(err)
		}

		// Merge(Event with resp)
		if err := db.Events.UpdateId(id, event); err == mgo.ErrNotFound {
			http.NotFound(w, r)
			return
		} else if err != nil {
			panic(err)
		}

		WriteJSON(w, event)
	} else {
		http.Error(w, "Error", 500)
		return
	}
}
func apiEventsAll(w http.ResponseWriter, r *http.Request) {
	events := []Event{}

	iter := db.Events.Find(nil).Iter()
	defer iter.Close()

	event := Event{}
	for iter.Next(&event) {
		events = append(events, event)
	}
	if err := iter.Close(); err != nil {
	}

	f, err := os.Open(path.Join(STATIC, "../server/events.json"))
	if err != nil {
		fmt.Println(err)
	}

	defer f.Close()

	err = json.NewDecoder(f).Decode(&events)
	fmt.Println(err)
	WriteJSON(w, events)
}

func apiEventsNew(w http.ResponseWriter, r *http.Request) {
	event := Event{EventId: bson.NewObjectId()}
	err := db.Events.Insert(&event)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(event.EventId)
	WriteJSON(w, event)
}

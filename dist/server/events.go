package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"reflect"

	"github.com/dutchcoders/gohunt/gohunt"
	"github.com/gorilla/mux"
	mgo "gopkg.in/mgo.v2"
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
	fmt.Println(vars)
	if id, ok := vars["id"]; ok {
		event := Event{}
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, "Error", 500)
			return
		}

		err := db.Events.UpdateId(bson.ObjectIdHex(id), event)
		if err != nil {
			http.Error(w, "Error", 500)
			return
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

var ErrNotSupported = errors.New("Not Supported")

func Filter(value interface{}, fn func(path string, value reflect.Value) error) error {
	switch reflect.ValueOf(value).Kind() {
	case reflect.Struct:
		fallthrough
	case reflect.Slice:
	default:
		return ErrNotSupported
	}
	return filter(reflect.ValueOf(value), "", fn)
}

func filter(value reflect.Value, path string, fn func(path string, value reflect.Value) error) error {
	if err := fn(path, value); err != nil {
		return err
	}
	switch value.Kind() {
	case reflect.Struct:
		for i := 0; i < value.NumField(); i++ {
			tField := value.Type().Field(i)

			if err := filter(value.Field(i), fmt.Sprintf("%s.%s", path, tField.Name), fn); err != nil {
				return err
			}
		}
	case reflect.Slice:
		for i := 0; i < value.Len(); i++ {
			if err := filter(value.Index(i), fmt.Sprintf("%s[]", path), fn); err != nil {
				return err
			}
		}
	default:
	}

	return nil
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

	Filter(events, func(path string, value reflect.Value) error {
		if path == "[].PhProfile.Votes" {
			v := reflect.ValueOf([]gohunt.Vote{})
			value.Set(v)
		}
		if path == "[].PhProfile.Posts" {
			v := reflect.ValueOf([]gohunt.Post{})
			value.Set(v)
		}
		if path == "[].PhProfile.Followers" {
			v := reflect.ValueOf([]gohunt.User{})
			value.Set(v)
		}
		if path == "[].PhProfile.Following" {
			v := reflect.ValueOf([]gohunt.User{})
			value.Set(v)
		}
		if path == "[].PhProfile.MakerOf[].Makers" {
			v := reflect.ValueOf([]gohunt.User{})
			value.Set(v)
		}

		return nil
	})

	WriteJSON(w, events)
}

func apiEventsCreate(w http.ResponseWriter, r *http.Request) {
	event := Event{}
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		log.Println(err)
		http.Error(w, "Error", 500)
		return
	}

	event.EventId = bson.NewObjectId()
	fmt.Println(event)

	err := db.Events.Insert(&event)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error", 500)
		return
	}
	WriteJSON(w, event)
}

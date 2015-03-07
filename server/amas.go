package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func apiAmaGet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	if id, ok := vars["id"]; ok {
		ama := AMA{}
		id := bson.ObjectIdHex(id)
		err := db.Amas.FindId(id).One(&ama)
		if err != nil {
			panic(err)
		}

		WriteJSON(w, ama)
	} else {
		http.Error(w, "Error", 500)
		return
	}
}

func apiAmaUpdate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	if id, ok := vars["id"]; ok {
		ama := AMA{}
		id := bson.ObjectIdHex(id)
		err := db.Amas.UpdateId(id, ama)
		if err != nil {
			log.Fatal(err)
		}

		WriteJSON(w, ama)
	} else {
		http.Error(w, "Missing id parameter.", 422)
		return
	}
}

func apiAmaDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	if id, ok := vars["id"]; ok {
		id := bson.ObjectIdHex(id)
		if err := db.Amas.RemoveId(id); err == mgo.ErrNotFound {
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

func apiAmaPatch(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	if id, ok := vars["id"]; ok {
		ama := AMA{}
		id := bson.ObjectIdHex(id)
		if err := db.Amas.FindId(id).One(&ama); err == mgo.ErrNotFound {
			http.NotFound(w, r)
			return
		} else if err != nil {
			panic(err)
		}

		// Merge(AMA with resp)
		if err := db.Amas.UpdateId(id, ama); err == mgo.ErrNotFound {
			http.NotFound(w, r)
			return
		} else if err != nil {
			panic(err)
		}

		WriteJSON(w, ama)
	} else {
		http.Error(w, "Error", 500)
		return
	}
}
func apiAmasAll(w http.ResponseWriter, r *http.Request) {
	amas := []AMA{}

	iter := db.Amas.Find(nil).Iter()
	defer iter.Close()

	ama := AMA{}
	for iter.Next(&ama) {
		amas = append(amas, ama)
	}
	if err := iter.Close(); err != nil {
	}

	WriteJSON(w, amas)
}

func apiAmasNew(w http.ResponseWriter, r *http.Request) {
	ama := AMA{AmaId: bson.NewObjectId()}
	err := db.Amas.Insert(&ama)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(ama.AmaId)
	WriteJSON(w, ama)
}

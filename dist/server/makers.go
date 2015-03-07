package main

import "net/http"

func apiMakersAll(w http.ResponseWriter, r *http.Request) {
	makers := cache.Makers()
	WriteJSON(w, makers)
}

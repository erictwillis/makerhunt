package main

import "net/http"

func apiMakersAll(w http.ResponseWriter, r *http.Request) {

	users, err := api.GetUsers()
	if err != nil {
		panic(err)
	}

	WriteJSON(w, users)
}

package main

import (
	"fmt"
	"net/http"
)

func apiUsers(w http.ResponseWriter, r *http.Request) {

	users, err := api.GetUsers()
	if err != nil {
		fmt.Println(err)
	}

	WriteJSON(w, users)
}

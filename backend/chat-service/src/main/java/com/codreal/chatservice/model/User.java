package com.codreal.chatservice.model;

import javax.persistence.*;

@Entity
public class User {

    @Id
    private String userName; // utilisé comme clé primaire (si unique)

    public User() {
    }

    public User(String userName) {
        this.userName = userName;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}

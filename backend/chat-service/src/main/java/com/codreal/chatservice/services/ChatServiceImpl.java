package com.codreal.chatservice.services;

import com.codreal.chatservice.exceptions.ChatNotFoundException;
import com.codreal.chatservice.exceptions.NoChatExistsInTheRepository;
import com.codreal.chatservice.model.Chat;
import com.codreal.chatservice.model.Message;
import com.codreal.chatservice.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Override
    public Chat addChat(Chat chat) {
        return chatRepository.save(chat); // l'ID est généré automatiquement grâce à @GeneratedValue
    }

    @Override
    public List<Chat> findallchats() throws NoChatExistsInTheRepository {
        List<Chat> chats = chatRepository.findAll();
        if (chats.isEmpty()) {
            throw new NoChatExistsInTheRepository();
        }
        return chats;
    }

    @Override
    public Chat getById(int id) throws ChatNotFoundException {
        return chatRepository.findById(id)
                .orElseThrow(ChatNotFoundException::new);
    }

    @Override
    public HashSet<Chat> getChatByFirstUserName(String username) throws ChatNotFoundException {
        HashSet<Chat> chats = chatRepository.getChatByFirstUserName(username);
        if (chats.isEmpty()) {
            throw new ChatNotFoundException();
        }
        return chats;
    }

    @Override
    public HashSet<Chat> getChatBySecondUserName(String username) throws ChatNotFoundException {
        HashSet<Chat> chats = chatRepository.getChatBySecondUserName(username);
        if (chats.isEmpty()) {
            throw new ChatNotFoundException();
        }
        return chats;
    }

    @Override
    public HashSet<Chat> getChatByFirstUserNameOrSecondUserName(String username) throws ChatNotFoundException {
        HashSet<Chat> chat1 = chatRepository.getChatByFirstUserName(username);
        HashSet<Chat> chat2 = chatRepository.getChatBySecondUserName(username);
        chat1.addAll(chat2);

        if (chat1.isEmpty()) {
            throw new ChatNotFoundException();
        }
        return chat1;
    }

    @Override
    public HashSet<Chat> getChatByFirstUserNameAndSecondUserName(String firstUserName, String secondUserName) throws ChatNotFoundException {
        HashSet<Chat> chat1 = chatRepository.getChatByFirstUserNameAndSecondUserName(firstUserName, secondUserName);
        HashSet<Chat> chat2 = chatRepository.getChatBySecondUserNameAndFirstUserName(firstUserName, secondUserName);

        chat1.addAll(chat2);
        if (chat1.isEmpty()) {
            throw new ChatNotFoundException();
        }
        return chat1;
    }

    @Override
    public Chat addMessage(Message message, int chatId) throws ChatNotFoundException {
        System.out.println("chatId: " + chatId);
        System.out.println("Message content: " + message.getReplymessage());
        System.out.println("Sender: " + message.getSenderEmail());

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(ChatNotFoundException::new);

        // Initialize messageList if null
        if (chat.getMessageList() == null) {
            chat.setMessageList(new ArrayList<>());
        }

        // Set the chat reference in the message
        message.setChat(chat);
        
        // Add the message to the chat's messageList
        chat.getMessageList().add(message);

        // Save the chat (this will cascade to save the message due to CascadeType.ALL)
        Chat savedChat = chatRepository.save(chat);
        
        System.out.println("Saved chat message count: " + (savedChat.getMessageList() != null ? savedChat.getMessageList().size() : 0));
        
        return savedChat;
    }

}

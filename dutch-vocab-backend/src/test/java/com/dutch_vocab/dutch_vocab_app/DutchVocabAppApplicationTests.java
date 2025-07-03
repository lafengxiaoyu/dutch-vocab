package com.dutch_vocab.dutch_vocab_app;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import org.bson.Document;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import static com.mongodb.client.model.Filters.eq;

@SpringBootTest
class DutchVocabAppApplicationTests {

	@Test
	void contextLoads() {
	}

    @Test
    void testConnection() {
        // Replace the placeholder with your MongoDB deployment's connection string
        String uri = "mongodb+srv://vugaozhy:puIClqoMwEs7D7lK@mymongo.wsf3b27.mongodb.net/dutch-vocab?retryWrites=true&w=majority&appName=myMongo";
        try (MongoClient mongoClient = MongoClients.create(uri)) {
            MongoDatabase database = mongoClient.getDatabase("sample_mflix");
            MongoCollection<Document> collection = database.getCollection("movies");
            Document doc = collection.find(eq("title", "Back to the Future")).first();
            if (doc != null) {
                System.out.println(doc.toJson());
            } else {
                System.out.println("No matching documents found.");
            }
        }
    }


    @Test
    void testConnection1() {
        // Replace the placeholder with your MongoDB deployment's connection string
        String uri = "mongodb+srv://vugaozhy:puIClqoMwEs7D7lK@mymongo.wsf3b27.mongodb.net/dutch-vocab?retryWrites=true&w=majority&appName=myMongo";
        try (MongoClient mongoClient = MongoClients.create(uri)) {
            MongoDatabase database = mongoClient.getDatabase("dutch-vocab");
            MongoCollection<Document> collection = database.getCollection("vocab");

            Document doc = collection.find(eq("id", "1")).first();
            if (doc != null) {
                System.out.println(doc.toJson());
            } else {
                System.out.println("No matching documents found.");
            }
        }
    }

}

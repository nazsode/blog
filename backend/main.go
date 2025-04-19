package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

// Post model
type Post struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Image     string    `json:"image"` // Resim dosya yolu
	CreatedAt time.Time `json:"created_at"`
}

var db *gorm.DB

func main() {
	// Uploads klasörü oluştur
	if err := os.MkdirAll("uploads", 0755); err != nil {
		log.Fatal("Uploads directory creation failed:", err)
	}

	// Database connection
	var err error
	db, err = gorm.Open("sqlite3", "test.db")
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	defer db.Close()

	// Migrate the schema
	db.AutoMigrate(&Post{})

	// Fiber app
	app := fiber.New()

	// CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowMethods: "GET,POST,PUT,DELETE",
	}))

	// Routes
	app.Get("/posts", GetPosts)
	app.Get("/posts/:id", GetPost)
	app.Post("/posts", CreatePost)  // Now handles image uploads
	app.Put("/posts/:id", UpdatePost)
	app.Delete("/posts/:id", DeletePost)

	// Static files
	app.Static("/uploads", "./uploads")

	// Start server
	log.Println("Server started on port 8080")
	log.Fatal(app.Listen(":8080"))
}

// Handlers
func GetPosts(c *fiber.Ctx) error {
	var posts []Post
	db.Find(&posts)
	return c.JSON(posts)
}

func GetPost(c *fiber.Ctx) error {
	id := c.Params("id")
	var post Post
	db.First(&post, id)
	return c.JSON(post)
}

func CreatePost(c *fiber.Ctx) error {
    // Parse form data (title, content, and image)
    title := c.FormValue("title")
    content := c.FormValue("content")
    file, err := c.FormFile("image")

    if err != nil && err != http.ErrMissingFile {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Error retrieving the file"})
    }

    var imagePath string
    if file != nil {
        // Generate unique filename
        ext := filepath.Ext(file.Filename)
        newFileName := uuid.New().String() + ext
        imagePath = "/uploads/" + newFileName

        // Save the file
        if err := c.SaveFile(file, "./uploads/"+newFileName); err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error saving the file"})
        }
    }

    // Create the post
    post := Post{
        Title:     title,
        Content:   content,
        Image:     imagePath,
        CreatedAt: time.Now(),
    }

    db.Create(&post)
    return c.Status(fiber.StatusCreated).JSON(post)
}

func UpdatePost(c *fiber.Ctx) error {
    id := c.Params("id")
    var existingPost Post

    // Find the existing post
    if err := db.First(&existingPost, id).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Post not found"})
    }

    // Parse the updated data
    var updatedPost Post
    if err := c.BodyParser(&updatedPost); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
    }

    // Update only the necessary fields (don't modify ID)
    existingPost.Title = updatedPost.Title
    existingPost.Content = updatedPost.Content
    existingPost.Image = updatedPost.Image

    // Save changes (won't change ID)
    db.Save(&existingPost)
    return c.JSON(existingPost)
}

func DeletePost(c *fiber.Ctx) error {
	id := c.Params("id")
	db.Delete(&Post{}, id)
	return c.SendStatus(fiber.StatusNoContent)
}

func UploadImage(c *fiber.Ctx) error {
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Error retrieving the file"})
	}

	// Benzersiz dosya adı oluştur
	ext := filepath.Ext(file.Filename)
	newFileName := uuid.New().String() + ext

	// Dosyayı kaydet
	if err := c.SaveFile(file, "./uploads/"+newFileName); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error saving the file"})
	}

	return c.JSON(fiber.Map{
		"imagePath": "/uploads/" + newFileName,
	})
}
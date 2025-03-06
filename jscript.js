document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll('.star a');
    const titleInput = document.getElementById("title-input");
    const addBtn = document.getElementById("add-btn");
    const logList = document.getElementById("log-list");
    const logList2 = document.getElementById("log-list2"); // For My Collection page
    const searchBtn = document.getElementById("search-btn");
    const searchBox = document.getElementById("search-box");
    const authorInput=document.getElementById("author-input");
    const genreInput=document.getElementById("genre-input");

    let selectedRating = 0;
    let books = JSON.parse(localStorage.getItem("books")) || []; // Retrieve stored books

    //  Star rating 
    stars.forEach((star, index1) => {
        star.addEventListener('click', (event) => {
            event.preventDefault();
            selectedRating = index1 + 1;

            // Highlight selected stars
            stars.forEach((s, index2) => {
                index1 >= index2 ? s.classList.add('active') : s.classList.remove('active');
            });
        });
    });

    function addBook() {
        const title = titleInput.value.trim();
        const author=authorInput.value.trim();
        const genre=genreInput.value.trim();

        if (title === "" || selectedRating === 0 || genre==="0") {
            alert("Please enter a title, genre, and select a rating.");
            return;
        }

        // Add book to localStorage
        books.push({ title, author,rating:selectedRating, genre });
        localStorage.setItem("books", JSON.stringify(books));

        alert("Book added! Go to 'My Collection' to see it.");

        // Reset fields
        titleInput.value = "";
        authorInput.value="";
        selectedRating = 0;
        stars.forEach(star => star.classList.remove('active'));

        displayCollection(); // Update My Collection page
    }

    function displayCollection() {
        let books = JSON.parse(localStorage.getItem("books")) || [];
        if (!logList2) return;
    
        logList2.innerHTML = "";
    
        if (books.length === 0) {
            logList2.innerHTML = "<p>No books added yet. Go to 'Home' and add some!</p>";
            return;
        }
    
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Rating</th>
                <th>Genre</th>
                
            </tr>
        `;
        table.appendChild(thead);
    
        const tbody = document.createElement("tbody");
    
        books.forEach((book, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.rating !== "N/A" ? "★".repeat(book.rating) + "☆".repeat(5 - book.rating) : "N/A"}</td>
                <td>${book.genre}</td>
                <td><button onclick="removeItem(${index})">Remove</button></td>
            `;
            tbody.appendChild(row);
        });
    
        table.appendChild(tbody);
        logList2.appendChild(table);
    }
    

    async function fetchData() {
        const query = searchBox.value.trim();
        if (query === "") {
            alert("Please enter a search term.");
            return;
        }

        const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.items) {
                displayGoogleBooks(data.items);
            } else {
                logList.innerHTML = "<li>No books found.</li>";
            }
        } catch (error) {
            console.error("Error fetching books:", error);
            logList.innerHTML = "<li>Error fetching books.</li>";
        }
    }

    function displayGoogleBooks(books) {
        logList.innerHTML = ""; // Clear previous search results
    
        books.forEach((book) => {
            const title = book.volumeInfo.title || "Unknown Title";
            const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(", ") : "Unknown Author";
            const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : "https://via.placeholder.com/128x192";
    
            const li = document.createElement("div");
            li.innerHTML = `
                <img src="${thumbnail}" alt="Book Cover"><br>
                <strong>${title}</strong> 
                <button onclick="addBookFromAPI('${title.replace(/'/g, "\\'")}', '${authors.replace(/'/g, "\\'")}')">Add to Collection</button>
                <br>
                <em>${authors}</em> <br>
            `;
            logList.appendChild(li);
        });
    }
    

    //  Make removeItem() Global
    window.removeItem = function(index) {
        let books = JSON.parse(localStorage.getItem("books")) || [];
        if (index < 0 || index >= books.length) {
            console.error("Invalid index:", index);
            return;
        }
        books.splice(index, 1);
        localStorage.setItem("books", JSON.stringify(books));
        displayCollection();
    };

    window.addBookFromAPI = function(title, author) {
        let books = JSON.parse(localStorage.getItem("books")) || [];
    
        // Create book object with default values for genre and rating
        let newBook = {
            title: title,
            author: author || "Unknown Author",  // Use provided author or default
            genre: "N/A",  // Default genre
            rating: "N/A"  // Default rating
        };
    
        books.push(newBook);
        localStorage.setItem("books", JSON.stringify(books));
    
        alert(`${title} added to collection.`);
        displayCollection(); // Refresh list after adding
    };  

    // Event Listeners
    if (searchBtn) searchBtn.addEventListener("click", fetchData);
    if (addBtn) addBtn.addEventListener("click", addBook);

    displayCollection(); // Load books on page load
});

// Get the currently reading image and title
const activeImg = document.getElementById("Active");
const bookTitle = document.getElementById("bookTitle");

// Get all inactive images
const inactiveImgs = document.querySelectorAll(".images");

inactiveImgs.forEach(inactiveImg => {
    inactiveImg.addEventListener("click", function() {
        let tempSrc = activeImg.src;
        let tempAlt = activeImg.alt;
        activeImg.src = this.src;
        activeImg.alt = this.alt;
        bookTitle.textContent = this.alt;

        this.src = tempSrc;
        this.alt = tempAlt;
    });
});
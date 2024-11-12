### README.md

---

# List and Like Instagram Image Grabber

A web scraper built with JavaScript that utilizes Selenium WebDriver (ChromeDriver) to gather image URLs from Instagram posts. This tool grabs each image, stores it in Google Cloud Storage, and saves the public URL to MongoDB. This setup enables seamless image display within the List and Like application, showcasing user posts for enhanced engagement.

## Features

-  **Instagram Image Scraping**: Uses Selenium WebDriver (ChromeDriver) to navigate Instagram and extract image URLs from user posts.
-  **Google Cloud Storage Integration**: Saves images in Google Cloud Storage, making them accessible via public URLs.
-  **MongoDB Storage**: Stores each image's public URL in MongoDB for easy access and management.
-  **Supports List and Like Application**: Facilitates the display of Instagram images within the List and Like application for a more interactive user experience.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/list_and_like_instagram_image_grabber.git
   cd list_and_like_instagram_image_grabber
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   -  Add your Google Cloud credentials for storage access. This should be a file called 'service_account.json' located at the project root.
   -  Set up MongoDB connection string and any other necessary credentials.

   To document the need for this file in your GitHub repository, here’s an updated README section to describe the purpose and structure of this file:

4. Required Files:

   -  For Winton Error logging to work. The following files has to be available: './logs/app_err.log' and './logs/app_info.log'
   -  In order to authenticate and scrape images from Instagram, the project requires a file containing a mock user’s credentials and cookies. This file should be created at `./ig_dummy_users` and should include the following:

   ```javascript
   // ./ig_dummy_users/dummy_user.js

   let username = "username";
   let password = "password";

   const cookies = [
      {
         domain: ".instagram.com",
         expirationDate: 1758061157.284422,
         hostOnly: false,
         httpOnly: false,
         name: "csrftoken",
         path: "/",
         sameSite: "None",
         secure: true,
         session: false,
         storeId: "1",
         value: "XXXYYYZZZ",
      },
      {
         domain: ".instagram.com",
         expirationDate: 1761171170.998047,
         hostOnly: false,
         httpOnly: true,
         name: "datr",
         path: "/",
         sameSite: "None",
         secure: true,
         session: false,
         storeId: "1",
         value: "XXXYYYZZZ-Nr",
      },
      // ... additional cookie objects ...
   ];

   module.exports = {
      username,
      password,
      cookies,
   };
   ```

   ### File Details

   -  **`username`**: Instagram username for the scraper account.
   -  **`password`**: Password associated with the Instagram account.
   -  **`cookies`**: Array of cookie objects to simulate authenticated access to Instagram.

5. Initialize the SQLite database used to gaurd against overlapping processes

   ```bash
   node database/init.js
   ```

6. Run the application:
   ```bash
   node index.js
   ```

## Usage

1. **Set Up ChromeDriver**: Ensure that ChromeDriver is installed and properly configured in your system PATH.
2. **Run the Scraper**: Execute the program to start scraping Instagram images.
3. **Monitor Storage and Database**: After each run, images are saved in Google Cloud Storage, and URLs are stored in MongoDB.

## Requirements

-  Node.js
-  MongoDB
-  Google Cloud Storage Account
-  Selenium WebDriver and ChromeDriver

## Contributing

Feel free to submit issues and pull requests to help improve the project!

# My Blog Project

This project is a simple blog application built with React and TypeScript. It features a sidebar for navigating through categories and blog posts, a header for useful functions, and a main content area for displaying blog titles and posts.

## Project Structure

```
my-blog
├── src
│   ├── components
│   │   ├── Header.tsx          # Header component displaying useful functions
│   │   ├── Sidebar
│   │   │   ├── Sidebar.tsx     # Sidebar component managing category visibility
│   │   │   ├── TitleCategory.tsx # Top-level category component
│   │   │   ├── MiddleCategory.tsx # Middle-level category component
│   │   │   └── DetailCategory.tsx # Detail-level category component
│   │   ├── BlogList.tsx        # Component displaying a list of blog titles
│   │   └── BlogPost.tsx        # Component displaying a specific blog post
│   ├── pages
│   │   ├── Home.tsx            # Main page of the blog
│   │   └── Post.tsx            # Page displaying a specific blog post
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Entry point of the application
│   └── types
│       └── index.ts            # TypeScript interfaces and types
├── package.json                 # npm configuration file
├── tsconfig.json                # TypeScript configuration file
├── vite.config.ts               # Vite configuration file
└── README.md                    # Project documentation
```

## Features

- **Sidebar Navigation**: The sidebar allows users to navigate through categories and view blog posts. Initially, only the title category is visible, and clicking on it reveals the middle and detail categories.
- **Blog List**: Each detail category displays a list of blog titles. Clicking on a title navigates to the corresponding blog post.
- **Responsive Design**: The application is designed to be responsive and user-friendly.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd my-blog
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and go to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you'd like to add.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
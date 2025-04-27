export interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  detailCategory: string;
}

export interface Category {
  title: string;
  middleCategories: MiddleCategory[];
}

export interface MiddleCategory {
  title: string;
  detailCategories: DetailCategory[];
}

export interface DetailCategory {
  title: string;
  blogPosts: BlogPost[];
}

export const categoriesData: Category[] = [
  {
    title: 'Tech',
    middleCategories: [
      {
        title: 'Frontend',
        detailCategories: [
          {
            title: 'React',
            blogPosts: [
              { id: '1', title: 'Getting Started with React', content: 'This is a React blog post.', category: 'Tech', detailCategory: 'React' }
            ]
          },
          {
            title: 'Vue',
            blogPosts: [
              { id: '2', title: 'Vue Guide', content: 'This is a Vue blog post.', category: 'Tech', detailCategory: 'Vue' }
            ]
          }
        ]
      },
      {
        title: 'Backend',
        detailCategories: [
          {
            title: 'NodeJS',
            blogPosts: [
              { id: '3', title: 'NodeJS APIs', content: 'This is a NodeJS blog post.', category: 'Tech', detailCategory: 'NodeJS' }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'Life',
    middleCategories: [
      {
        title: 'Travel',
        detailCategories: [
          {
            title: 'Asia',
            blogPosts: [
              { id: '4', title: 'Travel to Japan', content: 'This is a Japan travel blog.', category: 'Life', detailCategory: 'Asia' }
            ]
          }
        ]
      }
    ]
  }
];
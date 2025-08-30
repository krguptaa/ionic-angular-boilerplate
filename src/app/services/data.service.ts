import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { ApiService, PaginationOptions } from './api.service';
import { ToastService } from './toast.service';

// Example data models (you can move these to models/index.ts)
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  postCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private postsSubject = new BehaviorSubject<Post[]>([]);
  public posts$ = this.postsSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  // Posts CRUD operations
  getPosts(options: PaginationOptions = {}): Observable<{ items: Post[]; meta: any }> {
    return this.apiService.getPaginated<Post>('/posts', options).pipe(
      tap(result => {
        if (options.page === 1 || !options.page) {
          this.postsSubject.next(result.items);
        } else {
          const currentPosts = this.postsSubject.value;
          this.postsSubject.next([...currentPosts, ...result.items]);
        }
      })
    );
  }

  getPostById(postId: string): Observable<Post> {
    return this.apiService.get<Post>(`/posts/${postId}`);
  }

  createPost(postData: Partial<Post>): Observable<Post> {
    return this.apiService.post<Post>('/posts', postData).pipe(
      tap(newPost => {
        const currentPosts = this.postsSubject.value;
        this.postsSubject.next([newPost, ...currentPosts]);
        this.toastService.showSuccess('Post created successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to create post');
        throw error;
      })
    );
  }

  updatePost(postId: string, updates: Partial<Post>): Observable<Post> {
    return this.apiService.put<Post>(`/posts/${postId}`, updates).pipe(
      tap(updatedPost => {
        const currentPosts = this.postsSubject.value;
        const index = currentPosts.findIndex(p => p.id === postId);
        if (index !== -1) {
          currentPosts[index] = updatedPost;
          this.postsSubject.next([...currentPosts]);
        }
        this.toastService.showSuccess('Post updated successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to update post');
        throw error;
      })
    );
  }

  deletePost(postId: string): Observable<any> {
    return this.apiService.delete(`/posts/${postId}`).pipe(
      tap(() => {
        const currentPosts = this.postsSubject.value;
        const filteredPosts = currentPosts.filter(p => p.id !== postId);
        this.postsSubject.next(filteredPosts);
        this.toastService.showSuccess('Post deleted successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to delete post');
        throw error;
      })
    );
  }

  // Comments operations
  getPostComments(postId: string, options: PaginationOptions = {}): Observable<{ items: Comment[]; meta: any }> {
    return this.apiService.getPaginated<Comment>(`/posts/${postId}/comments`, options);
  }

  addComment(postId: string, content: string): Observable<Comment> {
    return this.apiService.post<Comment>(`/posts/${postId}/comments`, { content }).pipe(
      tap(() => {
        this.toastService.showSuccess('Comment added successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to add comment');
        throw error;
      })
    );
  }

  updateComment(commentId: string, content: string): Observable<Comment> {
    return this.apiService.put<Comment>(`/comments/${commentId}`, { content }).pipe(
      tap(() => {
        this.toastService.showSuccess('Comment updated successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to update comment');
        throw error;
      })
    );
  }

  deleteComment(commentId: string): Observable<any> {
    return this.apiService.delete(`/comments/${commentId}`).pipe(
      tap(() => {
        this.toastService.showSuccess('Comment deleted successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to delete comment');
        throw error;
      })
    );
  }

  // Categories operations
  getCategories(): Observable<Category[]> {
    return this.apiService.get<Category[]>('/categories').pipe(
      tap(categories => {
        this.categoriesSubject.next(categories);
      })
    );
  }

  getCategoryById(categoryId: string): Observable<Category> {
    return this.apiService.get<Category>(`/categories/${categoryId}`);
  }

  createCategory(categoryData: Partial<Category>): Observable<Category> {
    return this.apiService.post<Category>('/categories', categoryData).pipe(
      tap(newCategory => {
        const currentCategories = this.categoriesSubject.value;
        this.categoriesSubject.next([...currentCategories, newCategory]);
        this.toastService.showSuccess('Category created successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to create category');
        throw error;
      })
    );
  }

  updateCategory(categoryId: string, updates: Partial<Category>): Observable<Category> {
    return this.apiService.put<Category>(`/categories/${categoryId}`, updates).pipe(
      tap(updatedCategory => {
        const currentCategories = this.categoriesSubject.value;
        const index = currentCategories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
          currentCategories[index] = updatedCategory;
          this.categoriesSubject.next([...currentCategories]);
        }
        this.toastService.showSuccess('Category updated successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to update category');
        throw error;
      })
    );
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.apiService.delete(`/categories/${categoryId}`).pipe(
      tap(() => {
        const currentCategories = this.categoriesSubject.value;
        const filteredCategories = currentCategories.filter(c => c.id !== categoryId);
        this.categoriesSubject.next(filteredCategories);
        this.toastService.showSuccess('Category deleted successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to delete category');
        throw error;
      })
    );
  }

  // Search and filtering
  searchPosts(query: string, options: PaginationOptions = {}): Observable<{ items: Post[]; meta: any }> {
    return this.apiService.getPaginated<Post>('/posts/search', {
      ...options,
      search: query
    });
  }

  getPostsByCategory(categoryId: string, options: PaginationOptions = {}): Observable<{ items: Post[]; meta: any }> {
    return this.apiService.getPaginated<Post>(`/categories/${categoryId}/posts`, options);
  }

  getPostsByTag(tag: string, options: PaginationOptions = {}): Observable<{ items: Post[]; meta: any }> {
    return this.apiService.getPaginated<Post>('/posts', {
      ...options,
      filters: { tags: tag }
    });
  }

  // Bulk operations
  publishPosts(postIds: string[]): Observable<any> {
    return this.apiService.post('/posts/bulk-publish', { postIds }).pipe(
      tap(() => {
        // Update local state
        const currentPosts = this.postsSubject.value;
        const updatedPosts = currentPosts.map(post =>
          postIds.includes(post.id) ? { ...post, published: true } : post
        );
        this.postsSubject.next(updatedPosts);
        this.toastService.showSuccess(`${postIds.length} posts published successfully`);
      }),
      catchError(error => {
        this.toastService.showError('Failed to publish posts');
        throw error;
      })
    );
  }

  deleteMultiplePosts(postIds: string[]): Observable<any> {
    return this.apiService.post('/posts/bulk-delete', { postIds }).pipe(
      tap(() => {
        // Update local state
        const currentPosts = this.postsSubject.value;
        const filteredPosts = currentPosts.filter(post => !postIds.includes(post.id));
        this.postsSubject.next(filteredPosts);
        this.toastService.showSuccess(`${postIds.length} posts deleted successfully`);
      }),
      catchError(error => {
        this.toastService.showError('Failed to delete posts');
        throw error;
      })
    );
  }

  // Analytics and statistics
  getPostsStats(): Observable<any> {
    return this.apiService.get('/posts/stats');
  }

  getDashboardData(): Observable<any> {
    return this.apiService.get('/dashboard');
  }

  // File operations
  uploadPostImage(postId: string, file: File): Observable<any> {
    return this.apiService.uploadFile(`/posts/${postId}/images`, file, 'image').pipe(
      tap(() => {
        this.toastService.showSuccess('Image uploaded successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to upload image');
        throw error;
      })
    );
  }

  // Cache management
  refreshPosts(): void {
    this.getPosts({ page: 1, limit: 20 }).subscribe();
  }

  clearCache(): void {
    this.postsSubject.next([]);
    this.categoriesSubject.next([]);
  }

  // Getters for current state
  getCurrentPosts(): Post[] {
    return this.postsSubject.value;
  }

  getCurrentCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  // Utility methods
  getPostByIdFromCache(postId: string): Post | undefined {
    return this.postsSubject.value.find(post => post.id === postId);
  }

  getCategoryByIdFromCache(categoryId: string): Category | undefined {
    return this.categoriesSubject.value.find(category => category.id === categoryId);
  }
}
export interface Comment {
  id: string;
  boardId: string;
  authorName: string;
  authorColor: string;
  content: string;
  x: number;
  y: number;
  parentId: string | null;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateCommentInput = Pick<
  Comment,
  'content' | 'x' | 'y' | 'parentId' | 'authorName' | 'authorColor'
>;
export type UpdateCommentInput = Partial<Pick<Comment, 'content' | 'resolved'>>;

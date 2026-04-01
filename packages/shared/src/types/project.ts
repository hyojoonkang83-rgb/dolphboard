export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectInput = Pick<Project, 'name' | 'description' | 'color'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateBoardInput = Pick<Board, 'name' | 'description'>;
export type UpdateBoardInput = Partial<CreateBoardInput>;

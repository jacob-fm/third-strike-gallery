export type MoveCategory = 'normal' | 'special' | 'super';

export interface Move {
  name: string;
  input: string;
  category: MoveCategory;
  superArt?: 1 | 2 | 3;
  description?: string;
}

export interface Character {
  slug: string;
  name: string;
  nationality: string;
  fightingStyle: string;
  bio: string;
  portraitImage: string;
  artworkImage: string;
  moves: Move[];
}

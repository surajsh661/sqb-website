export type VideoType = 'vm' | 'gd' | 'yt' | 'ig';

export type Genre =
  | 'all' | 'ad' | 'film' | 'show' | 'ai' | 'vfx'
  | '3d' | 'music' | 'vertical' | 'docu' | 'podcast';

export interface Credit { role: string; name: string }

export interface Episode {
  /** YouTube video ID */
  id: string;
  /** Short label shown under the thumbnail */
  label: string;
}

export interface Film {
  id: string;
  title: string;
  category: string;
  genres: Genre[];
  year: string;
  runtime: string;
  type: VideoType;
  videoId: string;
  client: string;
  talent: string;
  lede?: string;
  body?: string;
  brief?: string;
  solution?: string;
  timeline?: string;
  release?: string;
  impact?: string;
  aspect?: string;
  credits: Credit[];
  /** YouTube playlist ID — for the "watch all" link */
  playlistId?: string;
  /** Episode catalog rendered below the case-study credits */
  episodes?: Episode[];
}

export interface AILabItem { id: string; title: string; type: VideoType; videoId: string; vertical?: boolean }
export interface AILabData {
  animated: AILabItem[];
  realistic: AILabItem[];
  vfx: AILabItem[];
}

export interface Vertical {
  id: string;
  title: string;
  tag: string;
  type: VideoType;
  videoId: string;
  genres: Genre[];
}

export interface Founder { id: string; name: string; role: string }
export interface TeamMember { id: string; name: string }
export interface TeamData { founders: Founder[]; team: TeamMember[] }

export interface Testimonial { quote: string; name: string; org: string }

export interface BTS {
  id: string; title: string; tag: string; type: VideoType; videoId: string;
}

export interface GenreOption { key: Genre; label: string }

export interface ClientLogo {
  name: string;
  src: string;
  size: number;
  /** When true, render the original art (just desaturated) instead of the
      flat brightness(0)+invert silhouette — for logos whose internal detail
      would be lost in the silhouette flatten. */
  keepDetails?: boolean;
  /** Special light-mode handling for logos the default silhouette destroys:
      'original' = show the real artwork unfiltered (full-colour self-contained
      icons); 'invert' = invert luminance in light mode so light artwork with
      internal detail reads as dark-on-cream instead of a solid black blob. */
  tone?: 'original' | 'invert';
}

export interface Creator {
  id: string;
  name: string;
  subs: string;
  blurb: string;
  videos: string[];
  flagship?: boolean;
}

export interface Cocoon {
  title: string;
  tagline: string;
  rating: string;
  ratingSource: string;
  imdb: string;
  watch: string;
  platform: string;
  blurb: string;
  music: { id: string; title: string; role: string; type: VideoType; videoId: string }[];
}

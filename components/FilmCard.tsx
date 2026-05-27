'use client';
import HeroThumb from './HeroThumb';
import type { Film } from '@/lib/types';

interface Props { film: Film; onClick: (f: Film) => void }

export default function FilmCard({ film, onClick }: Props) {
  const isVertical = (film.genres || []).includes('vertical') || film.aspect === '9:16';
  return (
    <div
      className={'film-card' + (isVertical ? ' is-vertical' : '')}
      onClick={() => onClick(film)}
      role="button"
      tabIndex={0}
    >
      <div className="film-thumb">
        <HeroThumb film={film} />
        <div className="film-shade" />
        <div className="film-play">▶</div>
      </div>
      <div className="film-meta">
        <div className="film-title">{film.title}</div>
        <div className="film-row">
          <span className="film-cat">{film.category}</span>
          <span className="film-year">{film.year}</span>
        </div>
      </div>
    </div>
  );
}

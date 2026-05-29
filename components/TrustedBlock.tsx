'use client';
import ClientLogos from './ClientLogos';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';

export default function TrustedBlock() {
  return (
    <section className="trusted-block">
      <div className="trusted-head">
        <h2>{rich(COPY.trustedBlock.heading)}</h2>
      </div>
      <ClientLogos />
    </section>
  );
}

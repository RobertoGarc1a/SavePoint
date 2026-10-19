import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SectionHeader({
  title,
  description,
  to,
  linkText,
}: {
  title: string;
  description?: string;
  to?: string;
  linkText?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p className="muted">{description}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {linkText ?? 'Ver más'} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

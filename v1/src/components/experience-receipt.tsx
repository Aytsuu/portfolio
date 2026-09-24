import {
  durationFromRange,
  formatDurationYears,
  isEducationExperience,
  totalWorkExperienceMonths,
} from "@/lib/experience-duration";

export interface ExperienceReceiptEntry {
  title: string;
  experiencedAt: string;
  year: string;
  location?: string;
  highlights?: string[];
  category?: "education" | "work";
}

interface ExperienceReceiptProps {
  experiences: ExperienceReceiptEntry[];
}

const receiptStamp = () => {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function ExperienceReceipt({ experiences }: ExperienceReceiptProps) {
  const issuedOn = receiptStamp();
  const totalMonths = totalWorkExperienceMonths(experiences);

  return (
    <article className="experience-receipt">
      <header className="experience-receipt-header">
        <p className="experience-receipt-brand">PAOLO ARANETA</p>
        <p className="experience-receipt-title">EXPERIENCE RECEIPT</p>
        <p className="experience-receipt-meta">{issuedOn}</p>
        <p className="experience-receipt-meta">Cebu, Philippines</p>
      </header>

      <p className="experience-receipt-rule" aria-hidden="true">
        --------------------------------
      </p>

      <ul className="experience-receipt-lines">
        {experiences.map((entry) => {
          const duration = durationFromRange(entry.year);
          const education = isEducationExperience(entry);

          return (
            <li key={`${entry.title}-${entry.year}`} className="experience-receipt-line">
              <div className="experience-receipt-row">
                <span className="experience-receipt-qty">01</span>
                <div className="experience-receipt-desc">
                  <p className="experience-receipt-item">{entry.title}</p>
                  <p className="experience-receipt-sub">{entry.experiencedAt}</p>
                  <p className="experience-receipt-sub">{entry.year}</p>
                  {entry.location ? (
                    <p className="experience-receipt-sub">{entry.location}</p>
                  ) : null}
                </div>
                <span className="experience-receipt-amount">
                  {education ? "EDU" : duration.label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="experience-receipt-rule" aria-hidden="true">
        --------------------------------
      </p>

      <div className="experience-receipt-total">
        <span className="experience-receipt-total-label">TOTAL EXPERIENCE</span>
        <span className="experience-receipt-total-value">
          {formatDurationYears(totalMonths)}
        </span>
      </div>

      <p className="experience-receipt-footer">THANK YOU FOR READING</p>
      <div className="experience-receipt-tear" aria-hidden="true" />
    </article>
  );
}

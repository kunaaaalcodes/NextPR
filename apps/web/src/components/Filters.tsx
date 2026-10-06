import type { ChangeEvent } from "react";
import { LANGUAGES } from "@/lib/types";

export interface FilterState {
  language: string;
  difficulty: string;
  label: string;
  minResponsiveness: string;
  minStars: string;
}
export const EMPTY_FILTERS: FilterState = {
  language: "",
  difficulty: "",
  label: "",
  minResponsiveness: "",
  minStars: "",
};

const ISSUE_LABELS = [
  { label: "Bounty", value: "bounty,bug bounty,bounty issue" },
  { label: "GSoC issue", value: "gsoc,gsoc issue,google summer of code" },
  {
    label: "Good first issue",
    value: "good first issue,good-first-issue,first-timers-only,beginner",
  },
  { label: "Help wanted", value: "help wanted" },
  { label: "Bug", value: "bug" },
  { label: "Enhancement", value: "enhancement" },
  { label: "Feature request", value: "feature request" },
  { label: "Documentation", value: "documentation,docs" },
  { label: "Accessibility", value: "accessibility,a11y" },
  { label: "Performance", value: "performance" },
  { label: "Security", value: "security" },
];

interface Props {
  value: FilterState;
  onChange: (v: FilterState) => void;
  languageLabel?: string;
}

export default function Filters({ value, onChange, languageLabel = "All languages" }: Props) {
  const set = (key: keyof FilterState) => (event: ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...value, [key]: event.target.value });
  return (
    <div className="filters" role="group" aria-label="Filter issues">
      <label className="filter-control">
        <span>Language</span>
        <select value={value.language} onChange={set("language")} aria-label="Language">
          <option value="">{languageLabel}</option>
          {LANGUAGES.map((language) => (
            <option key={language}>{language}</option>
          ))}
        </select>
      </label>
      <label className="filter-control">
        <span>Difficulty</span>
        <select value={value.difficulty} onChange={set("difficulty")} aria-label="Difficulty">
          <option value="">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <label className="filter-control">
        <span>Issue label</span>
        <select value={value.label} onChange={set("label")} aria-label="Issue label">
          <option value="">Any label</option>
          {ISSUE_LABELS.map((label) => (
            <option key={label.label} value={label.value}>
              {label.label}
            </option>
          ))}
        </select>
      </label>
      <label className="filter-control">
        <span>Maintainer activity</span>
        <select
          value={value.minResponsiveness}
          onChange={set("minResponsiveness")}
          aria-label="Maintainer responsiveness"
        >
          <option value="">Any activity</option>
          <option value="40">Responsive (40+)</option>
          <option value="60">Very responsive (60+)</option>
          <option value="80">Super responsive (80+)</option>
        </select>
      </label>
      <label className="filter-control">
        <span>Repository size</span>
        <select
          value={value.minStars}
          onChange={set("minStars")}
          aria-label="Minimum repository stars"
        >
          <option value="">Any stars</option>
          <option value="100">100+ stars</option>
          <option value="500">500+ stars</option>
          <option value="1000">1k+ stars</option>
          <option value="5000">5k+ stars</option>
          <option value="10000">10k+ stars</option>
          <option value="50000">50k+ stars</option>
        </select>
      </label>
    </div>
  );
}

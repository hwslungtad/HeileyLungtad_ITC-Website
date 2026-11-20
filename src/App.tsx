import { useEffect, useRef, useState } from "react";
import baymaxImage from "./assets/baymax.png";
import bluePikminImage from "./assets/blue-pikmin-contemplating.jpg";
import blueStarImage from "./assets/blue-star.png";
import cinamorollImage from "./assets/cinamoroll.jpg";
import jellyfishImage from "./assets/jellyfish.jpg";
import moonImage from "./assets/moon.jpg";
import seaImage from "./assets/sea.jpg";
import sunImage from "./assets/sun.jpg";
import vaporeonImage from "./assets/vaporeon.png";

type Tool = "payroll" | "numbers" | "tax" | "converter";
type Position = { x: number; y: number };
type PayrollEntry = {
  id: number;
  name: string;
  days: number;
  rate: number;
  deduction: number;
};

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const toolDetails: Record<Tool, { title: string; cardLines: [string, string] }> = {
  payroll: {
    title: "Simple Payroll",
    cardLines: ["Simple", "Payroll"],
  },
  numbers: {
    title: "Nth Number Lab",
    cardLines: ["Nth", "Number Lab"],
  },
  tax: {
    title: "Income Tax",
    cardLines: ["Income", "Tax"],
  },
  converter: {
    title: "Unit Converter",
    cardLines: ["Unit", "Converter"],
  },
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (tool: Tool) => void }) {
  const details = toolDetails[tool];
  return (
    <button className={`tool-card tool-card--${tool}`} onClick={() => onOpen(tool)}>
      <span className="tool-card__content">
        <strong>
          {details.cardLines[0]}
          <br />
          {details.cardLines[1]}
        </strong>
      </span>
    </button>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

function PayrollProgram() {
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [name, setName] = useState("");
  const [days, setDays] = useState("");
  const [rate, setRate] = useState("");
  const [deduction, setDeduction] = useState("");
  const [deleteNumber, setDeleteNumber] = useState("");
  const [error, setError] = useState("");
  const nextId = useRef(1);

  function addEmployee(event: React.FormEvent) {
    event.preventDefault();
    const daysValue = Number(days);
    const rateValue = Number(rate);
    const deductionValue = Number(deduction);

    if (!name.trim() || !days || !rate || !deduction) {
      setError("Complete all employee fields before adding a record.");
      return;
    }
    if (daysValue <= 0 || rateValue < 0 || deductionValue < 0) {
      setError("Days must be above zero; monetary values cannot be negative.");
      return;
    }

    setEntries((current) => [
      ...current,
      {
        id: nextId.current++,
        name: name.trim(),
        days: daysValue,
        rate: rateValue,
        deduction: deductionValue,
      },
    ]);
    setName("");
    setDays("");
    setRate("");
    setDeduction("");
    setError("");
  }

  function deleteEmployee(event: React.FormEvent) {
    event.preventDefault();
    const number = Number(deleteNumber);
    if (!Number.isInteger(number) || number < 1 || number > entries.length) {
      setError("Enter a line number currently shown in the table.");
      return;
    }
    setEntries((current) => current.filter((_, index) => index !== number - 1));
    setDeleteNumber("");
    setError("");
  }

  return (
    <div className="program">
      <form onSubmit={addEmployee}>
        <div className="form-grid form-grid--four">
          <Field
            label="Employee name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Maria Santos"
          />
          <Field
            label="Days worked"
            type="number"
            min="0.5"
            step="0.5"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            placeholder="20"
          />
          <Field
            label="Daily rate"
            type="number"
            min="0"
            step="0.01"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            placeholder="750.00"
          />
          <Field
            label="Deduction"
            type="number"
            min="0"
            step="0.01"
            value={deduction}
            onChange={(event) => setDeduction(event.target.value)}
            placeholder="500.00"
          />
        </div>
        <button className="primary-button" type="submit">
          Add employee <ArrowIcon />
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Employee</th>
              <th>Days</th>
              <th>Daily rate</th>
              <th>Gross pay</th>
              <th>Deduction</th>
              <th>Net pay</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">
                  No payroll records yet. Add your first employee above.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => {
                const gross = entry.days * entry.rate;
                return (
                  <tr key={entry.id}>
                    <td>{index + 1}</td>
                    <td className="employee-name">{entry.name}</td>
                    <td>{entry.days}</td>
                    <td>{peso.format(entry.rate)}</td>
                    <td>{peso.format(gross)}</td>
                    <td>{peso.format(entry.deduction)}</td>
                    <td className="net-pay">{peso.format(gross - entry.deduction)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <form className="delete-row" onSubmit={deleteEmployee}>
        <Field
          label="Remove by line number"
          type="number"
          min="1"
          value={deleteNumber}
          onChange={(event) => setDeleteNumber(event.target.value)}
          placeholder="No."
        />
        <button className="secondary-button" type="submit">
          Remove record
        </button>
      </form>
    </div>
  );
}

function NumberProgram() {
  const [n, setN] = useState("");
  const [results, setResults] = useState<{
    factorial: string;
    sum: number;
    average: number;
  } | null>(null);
  const [error, setError] = useState("");

  function calculate(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(n);
    if (!Number.isInteger(value) || value < 1 || value > 500) {
      setError("Enter a whole number from 1 to 500.");
      setResults(null);
      return;
    }

    let factorial = 1n;
    let factor = 1;
    while (factor <= value) {
      factorial *= BigInt(factor);
      factor++;
    }

    let sum = 0;
    let addend = 1;
    do {
      sum += addend;
      addend++;
    } while (addend <= value);

    let averageTotal = 0;
    for (let number = 1; number <= value; number++) {
      averageTotal += number;
    }

    setResults({ factorial: factorial.toString(), sum, average: averageTotal / value });
    setError("");
  }

  return (
    <div className="program">
      <form className="inline-form" onSubmit={calculate}>
        <Field
          label="Integer value (n)"
          type="number"
          min="1"
          max="500"
          step="1"
          value={n}
          onChange={(event) => setN(event.target.value)}
          placeholder="Enter 1–500"
        />
        <button className="primary-button" type="submit">
          Run calculations <ArrowIcon />
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <div className="result-grid">
        <article className="result-card result-card--wide">
          <span>While loop</span>
          <strong>Nth factorial</strong>
          <output>{results ? results.factorial : "—"}</output>
        </article>
        <article className="result-card">
          <span>Do-while loop</span>
          <strong>Sum of first n numbers</strong>
          <output>{results ? results.sum.toLocaleString() : "—"}</output>
        </article>
        <article className="result-card">
          <span>For loop</span>
          <strong>Average of first n numbers</strong>
          <output>{results ? results.average.toLocaleString() : "—"}</output>
        </article>
      </div>
    </div>
  );
}

function calculateTax(income: number) {
  if (income <= 250000) return { tax: 0, bracket: "₱0 – ₱250,000", rate: "0%" };
  if (income <= 400000)
    return { tax: (income - 250000) * 0.2, bracket: "Over ₱250,000 – ₱400,000", rate: "20%" };
  if (income <= 800000)
    return {
      tax: 30000 + (income - 400000) * 0.25,
      bracket: "Over ₱400,000 – ₱800,000",
      rate: "₱30,000 + 25%",
    };
  if (income <= 2000000)
    return {
      tax: 130000 + (income - 800000) * 0.3,
      bracket: "Over ₱800,000 – ₱2,000,000",
      rate: "₱130,000 + 30%",
    };
  if (income <= 8000000)
    return {
      tax: 490000 + (income - 2000000) * 0.32,
      bracket: "Over ₱2,000,000 – ₱8,000,000",
      rate: "₱490,000 + 32%",
    };
  return {
    tax: 2410000 + (income - 8000000) * 0.35,
    bracket: "Over ₱8,000,000",
    rate: "₱2,410,000 + 35%",
  };
}

function TaxProgram() {
  const [income, setIncome] = useState("");
  const numericIncome = Number(income);
  const result = income !== "" && numericIncome >= 0 ? calculateTax(numericIncome) : null;

  return (
    <div className="program tax-layout">
      <div>
        <Field
          label="Annual net taxable income"
          type="number"
          min="0"
          step="0.01"
          value={income}
          onChange={(event) => setIncome(event.target.value)}
          placeholder="Enter amount in PHP"
        />
        <div className="bracket-list">
          <span>Bracket</span>
          <strong>{result?.bracket ?? "Waiting for an income amount"}</strong>
          <span>Applied formula</span>
          <strong>{result?.rate ?? "—"}</strong>
        </div>
      </div>
      <div className="tax-result">
        <span>Estimated income tax</span>
        <output>{result ? peso.format(result.tax) : "₱—"}</output>
      </div>
    </div>
  );
}

const conversionOptions = {
  fToC: { label: "Fahrenheit to Celsius", from: "°F", to: "°C" },
  cToF: { label: "Celsius to Fahrenheit", from: "°C", to: "°F" },
  mToFt: { label: "Meters to Feet", from: "m", to: "ft" },
  ftToM: { label: "Feet to Meters", from: "ft", to: "m" },
};

type Conversion = keyof typeof conversionOptions;

function convert(value: number, type: Conversion) {
  if (type === "fToC") return (value - 32) * (5 / 9);
  if (type === "cToF") return value * (9 / 5) + 32;
  if (type === "mToFt") return value * 3.28084;
  return value / 3.28084;
}

function ConverterProgram() {
  const [type, setType] = useState<Conversion>("fToC");
  const [value, setValue] = useState("");
  const converted = value === "" ? null : convert(Number(value), type);
  const details = conversionOptions[type];

  return (
    <div className="program converter-layout">
      <div className="conversion-types" role="group" aria-label="Conversion type">
        {(Object.keys(conversionOptions) as Conversion[]).map((option) => (
          <button
            key={option}
            type="button"
            className={type === option ? "active" : ""}
            onClick={() => setType(option)}
          >
            <span>{conversionOptions[option].from}</span>
            {conversionOptions[option].label}
          </button>
        ))}
      </div>
      <div className="conversion-workspace">
        <p className="conversion-title">{details.label}</p>
        <div className="conversion-fields">
          <label className="conversion-field">
            <span>From</span>
            <div>
              <input
                type="number"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="0"
              />
              <b>{details.from}</b>
            </div>
          </label>
          <ArrowIcon />
          <label className="conversion-field">
            <span>Result</span>
            <div>
              <output>
                {converted === null ? "—" : Number(converted.toFixed(4)).toLocaleString()}
              </output>
              <b>{details.to}</b>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

function Modal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const [position, setPosition] = useState<Position>(() => {
    const preferredWidth = tool === "payroll" ? 940 : 760;
    const windowWidth = Math.min(preferredWidth, window.innerWidth - 32);
    return {
      x: Math.max(16, (window.innerWidth - windowWidth) / 2),
      y: Math.max(16, (window.innerHeight - 620) / 2),
    };
  });
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );
  const details = toolDetails[tool];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function startDrag(event: React.PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
  }

  function moveDrag(event: React.PointerEvent<HTMLElement>) {
    if (!drag.current) return;
    const maxX = Math.max(8, window.innerWidth - 120);
    const maxY = Math.max(8, window.innerHeight - 70);
    setPosition({
      x: Math.min(maxX, Math.max(8, drag.current.originX + event.clientX - drag.current.startX)),
      y: Math.min(maxY, Math.max(8, drag.current.originY + event.clientY - drag.current.startY)),
    });
  }

  return (
    <div className="modal-layer" role="presentation">
      <section
        className={`modal-window modal-window--${tool}`}
        style={{ left: position.x, top: position.y }}
        role="dialog"
        aria-labelledby="modal-title"
      >
        <header
          className="modal-header"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          <div>
            <h2 id="modal-title">{details.title}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close window">
            <span />
            <span />
          </button>
        </header>
        <div className="modal-content">
          {tool === "payroll" && <PayrollProgram />}
          {tool === "numbers" && <NumberProgram />}
          {tool === "tax" && <TaxProgram />}
          {tool === "converter" && <ConverterProgram />}
        </div>
      </section>
    </div>
  );
}

function ShowcaseImage({
  variant,
  src,
  alt,
}: {
  variant: "portrait" | "landscape";
  src: string;
  alt: string;
}) {
  return (
    <div className={`image-card image-card--${variant}`}>
      <img key={src} src={src} alt={alt} />
    </div>
  );
}

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  return (
    <main className="site-shell">
      <section className="dashboard" id="top">
        <article className="intro-card">
          <div className="intro-card__copy">
            <h1>Hi, I’m Heiley!</h1>
            <p>I'm a graphic designer &amp; student developer. i...</p>
            <ul>
              <li>
                <img src={blueStarImage} alt="" />
                <span>create collages, posters, infographics</span>
              </li>
              <li>
                <img src={blueStarImage} alt="" />
                <span>create arts &amp; crafts projects and journaling spreads</span>
              </li>
              <li>
                <img src={blueStarImage} alt="" />
                <span>create beginner programs</span>
              </li>
              <li>
                <img src={blueStarImage} alt="" />
                <span>have three cute dogs :&gt;</span>
              </li>
            </ul>
          </div>
        </article>

        <article className="contact-card">
          <div className="contact-card__copy">
            <h2>Reach out to me at:</h2>
            <p>Messenger/Facebook: Heiley Willyzah Lungtad</p>
            <p>Email: hlungtad@gmail.com</p>
            <p>Telegram: @Heiley_Izah</p>
            <p>Discord: _tsukkiisalive</p>
          </div>
          <img
            key={darkMode ? "baymax" : "vaporeon"}
            className="contact-card__image"
            src={darkMode ? baymaxImage : vaporeonImage}
            alt={darkMode ? "Baymax plush" : "Vaporeon plush"}
          />
        </article>

        <ToolCard tool="payroll" onOpen={setActiveTool} />
        <ToolCard tool="numbers" onOpen={setActiveTool} />
        <ToolCard tool="tax" onOpen={setActiveTool} />
        <ToolCard tool="converter" onOpen={setActiveTool} />

        <button
          className="theme-card"
          onClick={() => setDarkMode((current) => !current)}
          aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          aria-pressed={darkMode}
        >
          <img key={darkMode ? "moon" : "sun"} src={darkMode ? moonImage : sunImage} alt="" />
        </button>

        <ShowcaseImage
          variant="portrait"
          src={darkMode ? bluePikminImage : cinamorollImage}
          alt={darkMode ? "Blue Pikmin contemplating" : "Cinamoroll close-up"}
        />
        <ShowcaseImage
          variant="landscape"
          src={darkMode ? jellyfishImage : seaImage}
          alt={darkMode ? "Blue jellyfish" : "Sunlit sea"}
        />
      </section>

      {activeTool && <Modal tool={activeTool} onClose={() => setActiveTool(null)} />}
    </main>
  );
}

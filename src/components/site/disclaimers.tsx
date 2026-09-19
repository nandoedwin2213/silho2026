export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  return <p className={`text-xs leading-5 text-muted-foreground ${className}`}>Los resultados varían entre pacientes. Toda indicación depende de una valoración médica personalizada. No se prometen resultados.</p>;
}

export function ScarDisclaimer({ className = "" }: { className?: string }) {
  return <p className={`text-sm leading-6 text-muted-foreground ${className}`}>El objetivo es mejorar, atenuar y estimular la remodelación de la piel. Las cicatrices pueden ser ice pick, boxcar o rolling y requieren un plan individual.</p>;
}

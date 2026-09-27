/**
 * Un gabarit (contrairement au layout) est recréé à chaque navigation :
 * le contenu rejoue son entrée, pendant que la scène 3D du layout persiste.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}

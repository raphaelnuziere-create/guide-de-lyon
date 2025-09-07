// Redirection vers la page actualités principale
import { redirect } from 'next/navigation';

export default function LyonActualitesPage() {
  redirect('/actualites');
}
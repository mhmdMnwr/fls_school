# Notes de développement — FLS School Admin Panel

- **ESLint 9 Flat Config** : Configuration avec `--max-warnings 0` respectée. Les exports de variantes dans les composants UI (`src/components/ui/`) sont autorisés via la configuration d'exception locale.
- **Gestion des relations Mongoose** : Accès défensif aux champs relationnels (`schoolClass`, `subject`, `teacher`, `level`) qui peuvent être soit des objets peuplés, soit des chaînes ObjectId selon les requêtes.
- **Saisie de dates et heures** : Utilisation exclusive des inputs HTML5 natifs (`type="date"`, `type="time"`) conformément à la section 0 du plan.
- **Feuille d'appel** : Sauvegarde par lot via `PUT /absences/sessions/:id`, avec fusion automatique des élèves inscrits au groupe et gestion de l'alerte `beforeunload` en cas de modifications non enregistrées.
- **Filtres synchronisés dans l'URL** : Hook `useListParams` enrichi avec `setFilters` atomique pour éviter les écrasements d'URL lors de réinitialisations en chaîne.

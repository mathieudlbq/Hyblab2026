import React, { useRef, useEffect, useState, useCallback } from 'react';

// Codes des départements ciblés
const DEPT_CODES = ['86', '79', '17', '16'];
const DEPT_LABELS = {
  '86': 'Vienne',
  '79': 'Deux-Sèvres',
  '17': 'Charente-Maritime',
  '16': 'Charente',
};

/**
 * Modale de saisie de ville avec autocomplétion.
 *
 * Props :
 *  - isOpen      {boolean}           — contrôle l'ouverture automatique
 *  - isLoading   {boolean}           — spinner sur le bouton Valider
 *  - cityError   {string}            — message d'erreur externe
 *  - nArticles   {number}            — affiché dans le sous-titre
 *  - onSubmit    {Function({ name, lat, lng })} — ville sélectionnée + coordonnées
 *  - onSkip      {Function}          — continuer sans ville
 *  - modalRef    {Ref}               — ref pour fermer depuis le parent
 */
const CityModal = ({
  isOpen,
  isLoading,
  cityError,
  nArticles,
  onSubmit,
  onSkip,
  modalRef,
}) => {
  // ── Communes chargées depuis l'API ──
  const [communes, setCommunes]             = useState([]);
  const [loadingCommunes, setLoadingCommunes] = useState(true);

  // ── Autocomplétion ──
  const [inputValue, setInputValue]         = useState('');
  const [suggestions, setSuggestions]       = useState([]);
  const [selected, setSelected]             = useState(null); // { name, lat, lng, dept }
  const [showDropdown, setShowDropdown]     = useState(false);
  const inputRef                            = useRef(null);
  const dropdownRef                         = useRef(null);

  // Ouvrir la modale quand isOpen passe à true
  useEffect(() => {
    if (isOpen) modalRef.current?.showModal();
  }, [isOpen]);

  // Charger toutes les communes des 4 départements au montage
  useEffect(() => {
    const url = `https://geo.api.gouv.fr/communes?codesDepartements=${DEPT_CODES.join(',')}&fields=nom,centre,codeDepartement&boost=population`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        // data = [{ nom, codeDepartement, centre: { coordinates: [lng, lat] } }]
        const list = data
          .filter(c => c.centre?.coordinates)
          .map(c => ({
            name: c.nom,
            dept: DEPT_LABELS[c.codeDepartement] || c.codeDepartement,
            lng:  c.centre.coordinates[0],
            lat:  c.centre.coordinates[1],
          }));
        setCommunes(list);
        setLoadingCommunes(false);
      })
      .catch(err => {
        console.error('Erreur chargement communes :', err);
        setLoadingCommunes(false);
      });
  }, []);

  // Filtrer les suggestions sur la saisie (max 8)
  const handleInput = useCallback((e) => {
    const val = e.target.value;
    setInputValue(val);
    setSelected(null);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const q = val.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const filtered = communes
      .filter(c => {
        const n = c.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        return n.startsWith(q);
      })
      .slice(0, 8);

    setSuggestions(filtered);
    setShowDropdown(filtered.length > 0);
  }, [communes]);

  // Sélectionner une suggestion
  const handleSelect = (commune) => {
    setInputValue(commune.name);
    setSelected(commune);
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Valider
  const handleSubmit = () => {
    if (!selected) return;
    onSubmit({ name: selected.name, lat: selected.lat, lng: selected.lng });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && selected) handleSubmit();
    if (e.key === 'Escape') setShowDropdown(false);
  };

  // Fermer le dropdown si clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasError = cityError || (!selected && inputValue.length > 1);

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box overflow-visible">
        <h3 className="font-bold text-lg">📍 Choisir une ville de départ</h3>
        <p className="py-2 text-sm opacity-70">
          Entrez une commune pour trouver les {nArticles} articles les plus proches.
          <br />
          <span className="opacity-60">Départements : Vienne · Deux-Sèvres · Charente-Maritime · Charente</span>
        </p>

        {/* Champ avec autocomplétion */}
        <div className="form-control w-full mt-2" ref={dropdownRef}>
          <label className="label">
            <span className="label-text">Commune :</span>
          </label>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={loadingCommunes ? 'Chargement des communes…' : 'Ex: Poitiers, Niort, Saintes…'}
              className={`input input-bordered w-full ${selected ? 'input-success' : cityError ? 'input-error' : ''}`}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              disabled={loadingCommunes}
              autoFocus
              autoComplete="off"
            />

            {/* Dropdown des suggestions */}
            {showDropdown && (
              <ul className="absolute z-50 w-full bg-base-100 border border-base-300 rounded-box shadow-lg mt-1 max-h-56 overflow-y-auto">
                {suggestions.map((c, i) => (
                  <li
                    key={`${c.name}-${i}`}
                    className="px-4 py-2 cursor-pointer hover:bg-base-200 flex justify-between items-center"
                    onMouseDown={() => handleSelect(c)}
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs opacity-50">{c.dept}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Feedback */}
          {selected && (
            <label className="label">
              <span className="label-text-alt text-success">
                ✅ {selected.name} — {selected.dept}
              </span>
            </label>
          )}
          {cityError && (
            <label className="label">
              <span className="label-text-alt text-error">{cityError}</span>
            </label>
          )}
        </div>

        <div className="modal-action">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || !selected}
          >
            {isLoading
              ? <span className="loading loading-spinner loading-sm"></span>
              : 'Valider'}
          </button>
          <button className="btn" onClick={onSkip}>
            Continuer sans ville
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default CityModal;

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
  const [communes, setCommunes] = useState([]);
  const [loadingCommunes, setLoadingCommunes] = useState(true);

  // ── Autocomplétion ──
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null); // { name, lat, lng, dept }
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Ouvrir la modale quand isOpen passe à true
  useEffect(() => {
    if (isOpen) modalRef.current?.showModal();
  }, [isOpen]);

  // Charger toutes les communes des 4 départements au montage
useEffect(() => {
  const normalize = (str) =>
    str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  const fetchCommunes = async () => {
    try {
      setLoadingCommunes(true);

      const responses = await Promise.all(
        DEPT_CODES.map(code =>
          fetch(
            `https://geo.api.gouv.fr/departements/${code}/communes?fields=nom,centre,codeDepartement`
          ).then(r => r.json())
        )
      );

      const data = responses.flat();

      const list = data
        .filter(c => c.centre?.coordinates)
        .map(c => ({
          name: c.nom,
          search: normalize(c.nom), // clé optimisée pour la recherche
          dept: DEPT_LABELS[c.codeDepartement] || c.codeDepartement,
          lng: c.centre.coordinates[0],
          lat: c.centre.coordinates[1],
        }));

      setCommunes(list);
    } catch (err) {
      console.error("Erreur chargement communes :", err);
    } finally {
      setLoadingCommunes(false);
    }
  };

  fetchCommunes();
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

  const q = val
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  const filtered = communes
    .filter(c => c.search.includes(q))
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
    <dialog ref={modalRef} className={`modal ${isOpen ? 'modal-open' : ''} bg-white fixed inset-0 m-0 w-[100vw] h-[100vh] max-w-none max-h-none rounded-none p-0 overflow-y-auto`}>

        {/* Content */}
        <div className="relative z-20 w-full max-w-md mx-auto px-6 pointer-events-auto shadow-none align-center justify-center">

          <div className="text-center mb-10 text-sm">
            D'où voulez-vous commencer votre exploration ?
          </div>

          {/* Search Input */}
          <div className={`bg-[#f6e91e] rounded-full px-5 py-4 flex items-center shadow-md border-2 ${cityError ? 'border-red-500' : 'border-transparent'}`} align-center justify-center>
            <input
              ref={inputRef}
              type="text"
              placeholder={loadingCommunes ? 'Chargement...' : 'Sélectionnez une ville'}
              className="bg-transparent text-center outline-none flex-grow text-sm w-full align-center justify-center"
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              disabled={loadingCommunes}
              autoFocus
              autoComplete="off"
            />
          </div>

          {cityError && <p className="text-red-500 text-sm mt-3 ml-4 font-semibold">{cityError}</p>}

          {/* Suggestions List */}
          <div className="mt-5 flex flex-col gap-3">
            {showDropdown && suggestions.map((c, i) => (
              <button
                key={`${c.name}-${i}`}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(c); }}
                className="w-full bg-white rounded-full py-3.5 px-6 text-left shadow-sm cursor-pointer text-black hover:bg-gray-50 transition-colors font-medium text-sm border border-gray-100 flex items-center justify-between"
              >
                <span>{c.name}</span>
                <span className="text-sm opacity-50">{c.dept}</span>
              </button>
            ))}


            {/* Indicator Removed */}
          </div>

          {/* Validation & Actions */}
          {selected && !showDropdown && (
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                className="bg-black text-white font-semibold py-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors flex justify-center items-center text-sm w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Valider ma position'
                )}
              </button>
            </div>
          )}
        </div>
    </dialog>
  );
};

export default CityModal;
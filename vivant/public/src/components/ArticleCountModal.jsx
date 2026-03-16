import { useState } from 'react';
import rightSvg from './../assets/mr_patate/right.svg';

const ArticleCountModal = ({ modalRef, defaultCount = 10, onConfirm }) => {
  const [count, setCount] = useState(defaultCount);
  const MIN = 1;
  const MAX = 20;

  const handleConfirm = () => {
    modalRef.current?.close();
    onConfirm(count);
  };

  return (
    <dialog
      ref={modalRef}
      className="modal modal-middle"
    >
      <div className="modal-box bg-white rounded-[28px] shadow-2xl px-5 py-5 max-w-sm w-[90vw] mx-auto">

        <h3 className="text-lg font-bold text-center mb-1 text-primary">
          Combien d'articles souhaitez-vous explorer ?
        </h3>


        <div className="flex justify-center mb-4">
          <span className="text-5xl font-extrabold">{count}</span>
        </div>

        <input
          type="range"
          min={MIN}
          max={MAX}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{
            '--thumb-img': `url(${rightSvg})`,
            '--value-percent': `${((count - MIN) / (MAX - MIN)) * 100}%`
          }}
          className="range range-secondary w-full slider-thumb-image"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          <span>{MIN}</span>
          <span>{MAX}</span>
        </div>

        <div className="modal-action mt-6 justify-center">
          <button
            onClick={handleConfirm}
            className="btn btn-secondary rounded-full px-10 py-3 font-semibold border-none shadow-lg text-sm text-primary"
          >
            C'est parti !
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ArticleCountModal;

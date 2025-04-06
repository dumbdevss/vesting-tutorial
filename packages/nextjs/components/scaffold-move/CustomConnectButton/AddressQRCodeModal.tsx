import { QRCodeSVG } from "qrcode.react";
import { Address } from "~~/components/scaffold-move";

type AddressQRCodeModalProps = {
  address: string;
  modalId: string;
  setShow: (show: boolean) => void;
};

export const AddressQRCodeModal = ({ address, modalId, setShow }: AddressQRCodeModalProps) => {
  const closeModal = () => setShow(false);

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevents click from bubbling up to the outer div
  };

  return (
    <div className="">
      {/* Blurry backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm z-40 cursor-pointer"
        onClick={closeModal}
      ></div>
      {/* Modal content */}
      <div
        onClick={closeModal}
        className="absolute w-screen flex justify-center items-center min-h-screen bg-gray-800 left-0 top-0 cursor-pointer z-50"
      >
        <div
          className="modal-box p-6 max-w-sm border-2 border-base-300 shadow-xl"
          onClick={handleModalClick}
        >
          <button
            className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
            onClick={closeModal}
          >
            ✕
          </button>
          <div className="space-y-6 py-6 flex flex-col items-center">
            <QRCodeSVG value={address} size={256} />
            <div className="break-all text-center">
              <Address address={address} format="long" disableAddressLink />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
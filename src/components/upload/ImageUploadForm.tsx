import { useEffect, useRef, useState } from "react";

import { Upload, X } from "lucide-react";

export interface ImageUploadFormProps {
	/**
	 * Optional initial image url (e.g. when editing an existing record)
	 */
	defaultImage?: string;
	/**
	 * Receives the selected image file or `null` when the selection is cleared.
	 */
	onChange: (file: File | null) => void;
	/**
	 * Disables the input when `true`.
	 */
	disabled?: boolean;
	/** Optional label text */
	label?: string;
}

export const ImageUploadForm = ({
	defaultImage,
	onChange,
	disabled = false,
}: ImageUploadFormProps) => {
	const [previewUrl, setPreviewUrl] = useState<string>(defaultImage ?? "");
	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		// Revoke object URL when component unmounts or a new file is chosen
		return () => {
			if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;

		if (!file) {
			setPreviewUrl("");
			onChange(null);
			return;
		}

		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		onChange(file);
	};

	return (
		<div className="relative">
			{previewUrl ? (
				<div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-800 border border-gray-600">
					<img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />

					<button
						onClick={() => setPreviewUrl("")}
						className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
					>
						<X className="w-3 h-3" />
					</button>
				</div>
			) : (
				<button
					onClick={() => inputRef.current?.click()}
					disabled={disabled}
					className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Upload className="w-4 h-4 text-gray-400" />
					<span className="text-xs text-gray-400">Seleccionar imagen</span>
				</button>
			)}
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
			/>
		</div>
	);
};

// Named export for tree-shaking friendliness
export default ImageUploadForm;

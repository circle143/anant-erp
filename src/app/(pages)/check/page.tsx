"use client";

import React, { useState } from "react";
import { getUrl, uploadData } from "aws-amplify/storage";

export default function App() {
	const [file, setFile] = useState<File | undefined>();
	const [url, setUrl] = useState<string>();

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFile(event.target.files?.[0]);
	};

	const handleClick = () => {
		if (!file) {
			return;
		}
		uploadData({
			path: `photos/${file.name}`,
			data: file,
		});
	};

	const handleDownload = async () => {
		let bucketpath = "photos/logo.png"; // this is already present in s3

		const getUrlResult = await getUrl({
			path: bucketpath,
			options: {
				validateObjectExistence: true,
				expiresIn: 3600,
			},
		});

		setUrl(getUrlResult.url.toString());
	};

	return (
		<div>
			<input type="file" onChange={handleChange} />
			<button onClick={handleClick}>Upload</button>

			<button onClick={handleDownload}>get image</button>
			{url && <img src={url} />}
		</div>
	);
}

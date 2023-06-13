import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { M3uParser } from "@pawanpaudel93/m3u-parser";
import ReactJson from "react-json-view";

const App = () => {
  const [renderedJSON, setRenderedJSON] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [format, setFormat] = useState("m3u");
  const parser = new M3uParser();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/mpegurl": [".m3u"],
    },
    onDrop: async (acceptedFiles) => {
      // Handle dropped files and render JSON
      setIsLoading(true);
      const file = acceptedFiles[0];
      setFileName(file.name.split(".").slice(0, -1).join("."));
      await parser.parseM3u(file);
      setRenderedJSON(parser.getStreamsInfo());
      setIsLoading(false);
    },
  });

  async function download() {
    await parser.saveToFile(fileName, format);
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-gray-200 p-8">
        <div
          {...getRootProps({
            className:
              "dropzone border-2 border-dashed border-gray-400 rounded-md p-5 text-center cursor-pointer",
          })}
        >
          <input {...getInputProps()} />
          <p className="text-lg text-black">
            Drag 'n' drop an .m3u file here, or click to select a file
          </p>
          <em className="text-sm text-black">
            (Only *.m3u file will be accepted)
          </em>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <div className="spinner border-t-2 border-b-2 border-gray-400 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        )}
      </div>
      <div className="w-1/2 bg-gray-100 p-8 overflow-auto">
        {!isLoading && Object.keys(renderedJSON).length > 0 && (
          <div className="flex items-center mb-4 sticky top-0 bg-white p-4 z-50">
            <span className="mr-2 text-black">Download Format:</span>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              onChange={(event) => setFormat(event.target.value)}
            >
              <option value="json">JSON</option>
              <option value="m3u">M3U</option>
            </select>
            <div className="flex justify-center items-center ml-3 gap-3">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                onClick={download}
              >
                Download
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded"
                onClick={() => {
                  setRenderedJSON({});
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <ReactJson src={renderedJSON} />
      </div>
    </div>
  );
};

export default App;

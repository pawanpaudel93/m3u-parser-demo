import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { M3uParser, StreamInfo } from "@pawanpaudel93/m3u-parser";
import ReactJson from "react-json-view";

const App = () => {
  const [renderedJSON, setRenderedJSON] = useState<StreamInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [format, setFormat] = useState("m3u");
  const [filterOption, setFilterOption] = useState<{
    key: string;
    filters: string[];
    retrieve: string;
    nestedKey: string;
  }>({
    key: "name",
    filters: [],
    retrieve: "true",
    nestedKey: "false",
  });

  const [sortOption, setSortOption] = useState<{
    key: string;
    asc: string;
    nestedKey: string;
  }>({
    key: "name",
    asc: "true",
    nestedKey: "false",
  });

  const keys = [
    "name",
    "logo",
    "url",
    "category",
    "tvg-id",
    "tvg-name",
    "tvg-url",
    "live",
    "country-code",
    "country-name",
    "language-code",
    "language-name",
  ];
  const [parser] = useState(new M3uParser());

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/mpegurl": [".m3u"],
    },
    onDrop: async (acceptedFiles) => {
      setIsLoading(true);
      const file = acceptedFiles[0];
      setFileName(file.name.split(".").slice(0, -1).join("."));
      await parser.parseM3u(file);
      updateJSON();
      setIsLoading(false);
    },
  });

  function updateJSON() {
    setRenderedJSON([...parser.getStreamsInfo()]);
  }

  async function download() {
    await parser.saveToFile(fileName, format);
  }

  async function filter() {
    setIsLoading(true);
    const { key, nestedKey, filters, retrieve } = filterOption;
    parser.filterBy(
      key,
      filters,
      retrieve === "true",
      nestedKey === "true",
      "-"
    );
    updateJSON();
    setIsLoading(false);
  }

  async function sort() {
    setIsLoading(true);
    const { key, nestedKey, asc } = sortOption;
    parser.sortBy(key, asc === "true", nestedKey === "true", "-");
    updateJSON();
    setIsLoading(false);
  }

  async function resetOperations() {
    setIsLoading(true);
    parser.resetOperations();
    updateJSON();
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <div className="w-full sm:w-1/2 bg-gray-200 p-8">
        <div
          {...getRootProps({
            className:
              "dropzone border-2 border-dashed border-gray-400 rounded-md p-5 text-center cursor-pointer h-40 flex justify-center items-center",
          })}
        >
          <div>
            <input {...getInputProps()} />
            <p className="text-lg text-black">
              Drag 'n' drop an .m3u file here, or click to select a file
            </p>
            <em className="text-sm text-black">
              (Only *.m3u file will be accepted)
            </em>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <div className="spinner border-t-2 border-b-2 border-gray-400 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        )}
        {/* Add filter and sort options here */}
        <div className="flex flex-col my-4">
          <div className="flex items-center mb-4">
            <span className="mr-2 text-black">Filter by:</span>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={filterOption.key}
              onChange={(event) =>
                setFilterOption((prevOption) => ({
                  ...prevOption,
                  key: event.target.value,
                  nestedKey:
                    event.target.value.indexOf("-") > -1 ? "true" : "false",
                }))
              }
            >
              <option value="">Select Key</option>
              {keys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 ml-2 w-full sm:w-96"
              placeholder="Filter values separated by comma"
              value={filterOption.filters.join(",")}
              onChange={(event) =>
                setFilterOption((prevOption) => ({
                  ...prevOption,
                  filters: event.target.value.split(","),
                }))
              }
            />
            <select
              className="border border-gray-300 rounded px-2 py-1 ml-2"
              value={filterOption.retrieve}
              onChange={(event) =>
                setFilterOption((prevOption) => ({
                  ...prevOption,
                  retrieve: event.target.value,
                }))
              }
            >
              <option value="true">Retrieve</option>
              <option value="false">Exclude</option>
            </select>

            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded ml-2"
              onClick={filter}
            >
              Filter
            </button>
          </div>
          <div className="flex items-center mb-4">
            <span className="mr-2 text-black">Sort by:</span>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={sortOption.key}
              onChange={(event) =>
                setSortOption((prevOption) => ({
                  ...prevOption,
                  key: event.target.value,
                  nestedKey:
                    event.target.value.indexOf("-") > -1 ? "true" : "false",
                }))
              }
            >
              <option value="">Select Key</option>
              {keys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded px-2 py-1 ml-2"
              value={sortOption.asc}
              onChange={(event) =>
                setSortOption((prevOption) => ({
                  ...prevOption,
                  asc: event.target.value,
                }))
              }
            >
              <option value="true">Ascending</option>
              <option value="false">Descending</option>
            </select>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded ml-2"
              onClick={sort}
            >
              Sort
            </button>
          </div>
        </div>
      </div>
      <div className="w-full sm:w-1/2 bg-gray-100 p-8 overflow-auto h-full">
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
                  setRenderedJSON([]);
                }}
              >
                Clear
              </button>

              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded"
                onClick={resetOperations}
              >
                Reset Operations
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

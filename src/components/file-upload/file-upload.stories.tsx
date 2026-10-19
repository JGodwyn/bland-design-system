import { useEffect, useRef, useState } from 'react';
import type { Story } from '../../../playground/story';
import { FileUpload, type FileUploadFile } from './FileUpload';

/** Figma's master width, file-upload/width; the component itself fills its container. */
const frame = { width: 'var(--file-upload-width)', maxWidth: '100%' };

const rows: FileUploadFile[] = [
  { id: 'a', name: 'Moodboard.jpg', status: 'uploading', progress: 50, description: '2.4 MB' },
  { id: 'b', name: 'Brand guidelines.pdf', status: 'uploaded', description: '840 KB' },
  { id: 'c', name: 'Logo.svg', status: 'success', description: '12 KB' },
  { id: 'd', name: 'Launch video.mov', status: 'danger', description: 'File is over the 10 MB limit' },
];

const longName: FileUploadFile[] = [
  {
    id: 'long',
    name: 'Quarterly product review with every appendix and the final sign off notes.pdf',
    description: 'The name stays on one line',
  },
];

const size = (bytes: number) => (bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`);

/** The live demo: picked or dropped files "upload" over two seconds, then succeed. */
function Uploader(props: { title: string; description: string; fileTypes: string; multiple: boolean; disabled: boolean }) {
  const [files, setFiles] = useState<FileUploadFile[]>(rows.slice(1, 2));
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearInterval), []);

  const onFilesAdd = (added: File[]) => {
    const next = added.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      name: file.name,
      description: size(file.size),
      status: 'uploading' as const,
      progress: 0,
    }));
    setFiles((list) => [...list, ...next]);
    for (const row of next) {
      const timer = window.setInterval(() => {
        setFiles((list) =>
          list.map((f) => {
            if (f.id !== row.id) return f;
            const progress = (f.progress ?? 0) + 25;
            if (progress < 100) return { ...f, progress };
            clearInterval(timer);
            return { ...f, progress: 100, status: 'success' };
          }),
        );
      }, 500);
      timers.current.push(timer);
    }
  };

  return (
    <FileUpload
      title={props.title}
      description={props.description || undefined}
      fileTypes={props.fileTypes || undefined}
      multiple={props.multiple}
      disabled={props.disabled}
      files={files}
      onFilesAdd={onFilesAdd}
      onRemove={(id) => setFiles((list) => list.filter((f) => f.id !== id))}
    />
  );
}

/** Shows the drag-over state by sending the zone a real dragenter carrying a file. */
function DragOver() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const zone = ref.current?.querySelector('.bland-file-upload__dropzone');
    if (!zone) return;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(['x'], 'photo.png', { type: 'image/png' }));
    zone.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }));
  }, []);
  return (
    <div ref={ref} style={frame}>
      <FileUpload title="Upload file" fileTypes="SVG, PNG, JPG, or GIF" />
    </div>
  );
}

/** Used by the behaviour tests: added files become uploaded rows; rejected drops are counted. */
function Live() {
  const [files, setFiles] = useState<FileUploadFile[]>([]);
  const [rejected, setRejected] = useState(0);
  return (
    <div style={frame} data-testid="live">
      <FileUpload
        title="Images"
        fileTypes="PNG or JPG"
        accept="image/png,.jpg"
        multiple
        files={files}
        onFilesAdd={(added) =>
          setFiles((list) => [...list, ...added.map((f) => ({ id: f.name, name: f.name, description: size(f.size) }))])
        }
        onFilesReject={(list) => setRejected((n) => n + list.length)}
        onRemove={(id) => setFiles((list) => list.filter((f) => f.id !== id))}
      />
      <span className="pg-label" data-testid="rejected">
        Rejected: {rejected}
      </span>
    </div>
  );
}

export default {
  title: 'File Upload',
  description:
    'A drop zone plus the list of added files. People click the zone or drag files onto it; the app uploads them and passes each one back as a row. Drop zone states: rest, hover, drag-over (files are being dragged over it), disabled; disabled hides the file list. Rows: uploading (progress bar; the close button cancels), uploaded (the close button removes the file), success, danger (the description says why; the close button removes the file). The filename stays on one line and truncates. Added files and finished uploads are announced. Fills its container; Figma\'s master width is file-upload/width.',
  components: ['FileUpload'],
  demo: {
    component: 'FileUpload',
    args: {
      title: 'Upload file',
      description: '',
      fileTypes: 'SVG, PNG, JPG, or GIF',
      multiple: true,
      disabled: false,
    },
    controls: {
      title: { kind: 'text' },
      description: { kind: 'text' },
      fileTypes: { kind: 'text' },
      instruction: false,
      accept: false,
      name: false,
      filesLabel: false,
    },
    render: (args) => (
      <div style={frame}>
        <Uploader {...(args as Parameters<typeof Uploader>[0])} />
      </div>
    ),
    code: ({ description, fileTypes, ...args }) => ({
      ...args,
      ...(description ? { description } : {}),
      ...(fileTypes ? { fileTypes } : {}),
      files: '{files}',
      onFilesAdd: '{upload}',
      onRemove: '{remove}',
    }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Rest: title and file types (Figma's default)</span>
        <div style={frame}>
          <FileUpload title="Upload file" fileTypes="SVG, PNG, JPG, or GIF" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">description; no file types</span>
        <div style={frame}>
          <FileUpload title="Attachments" description="Add the files your reviewer needs" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">No title: name it with aria-label</span>
        <div style={frame}>
          <FileUpload aria-label="Upload file" fileTypes="PDF up to 10 MB" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Drag-over: files are being dragged over the zone</span>
        <DragOver />
      </div>

      <div className="pg-stack">
        <span className="pg-label">files: uploading, uploaded, success and danger</span>
        <div style={frame}>
          <FileUpload title="Upload file" fileTypes="SVG, PNG, JPG, or GIF" files={rows} onRemove={() => {}} />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">A long filename truncates with an ellipsis</span>
        <div style={frame}>
          <FileUpload title="Upload file" files={longName} onRemove={() => {}} />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">disabled: the file list is hidden (Figma)</span>
        <div style={frame}>
          <FileUpload title="Upload file" fileTypes="SVG, PNG, JPG, or GIF" files={rows} disabled />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Live: pick or drop images (accept image/png and .jpg)</span>
        <Live />
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus; forced on here to show it</span>
        <div className="pg-focus" style={frame}>
          <FileUpload title="Upload file" files={rows.slice(1, 2)} onRemove={() => {}} />
        </div>
      </div>
    </>
  ),
} satisfies Story;

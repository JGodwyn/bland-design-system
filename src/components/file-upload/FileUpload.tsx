import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useVisuallyHidden } from 'react-aria';
import { CheckCircleIcon, CloudArrowUpIcon, FileArrowUpIcon, WarningOctagonIcon, XIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import { ProgressBar } from '../progress-bar/ProgressBar';
import './file-upload.css';

/** `Status`. */
export type FileUploadStatus = 'uploading' | 'uploaded' | 'success' | 'danger';

/** One row of the file list (Figma `_file-upload-progress`). */
export interface FileUploadFile {
  /** Stable key, passed back to `onRemove`. */
  id: string;
  /** One line, truncated with an ellipsis. */
  name: string;
  /**
   * uploading shows a progress bar and the close button cancels; uploaded shows the close button
   * to remove the file; success shows a check and no close button; danger shows a warning, a danger border and
   * description, and the close button removes the file. Defaults to uploaded.
   */
  status?: FileUploadStatus;
  /** Under the name, such as the size, or why the upload failed. */
  description?: ReactNode;
  /** Upload progress from 0 to 100, shown while `status` is uploading. */
  progress?: number;
}

/** What the polite live region says. Each one returns the sentence to announce. */
export interface FileUploadAnnouncements {
  /** Files were picked or dropped. Defaults to "Added a.png, b.png". */
  added?: (names: string[]) => string;
  /** A file's status turned success. Defaults to "a.png uploaded". */
  success?: (name: string) => string;
  /** A file's status turned danger. Defaults to "a.png failed to upload". */
  danger?: (name: string) => string;
}

interface FileUploadBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onDrop'> {
  /** Under the title. */
  description?: ReactNode;
  /** The small line in the drop zone, such as "SVG, PNG, JPG, or GIF". */
  fileTypes?: ReactNode;
  /** The drop zone's instruction. Defaults to "Drag and drop files here or / click to upload", on two lines. */
  instruction?: ReactNode;
  /** Native `accept`: filters the file picker, and dropped files that don't match go to `onFilesReject`. */
  accept?: string;
  /** Native `multiple`: more than one file per pick or drop. Without it, a drop keeps the first file. */
  multiple?: boolean;
  /**
   * Native `name`. With it, the input keeps the last picked or dropped files for a form submit; without it, the
   * input is cleared after each pick, so the same file can be picked again.
   */
  name?: string;
  /** The drop zone takes no files, and the file list is hidden. */
  disabled?: boolean;
  /** Called with the files people pick or drop. Adding them to `files` and uploading them is the app's job. */
  onFilesAdd?: (files: File[]) => void;
  /** Called with dropped files that don't match `accept`. */
  onFilesReject?: (files: File[]) => void;
  /** The rows under the drop zone. The list shows while it has rows. */
  files?: FileUploadFile[];
  /** Called when a row's close button is pressed: cancel the upload (uploading) or remove the file. */
  onRemove?: (id: string) => void;
  /** Accessible name of a row's close button. Defaults to "Remove <name>", or "Cancel upload of <name>" while uploading. */
  removeLabel?: (file: FileUploadFile) => string;
  /** Accessible name of the file list. Defaults to "Files". */
  filesLabel?: string;
  /** Override what the live region announces. */
  announcements?: FileUploadAnnouncements;
  /** Every other prop of the native file input. */
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'accept' | 'multiple' | 'name' | 'disabled'>;
}

/** The drop zone needs a name: a visible `title`, or `aria-label` / `aria-labelledby`. */
export type FileUploadProps = FileUploadBaseProps &
  (
    | {
        /** Above the drop zone, and the file input's accessible name. */
        title: ReactNode;
      }
    | { title?: undefined; 'aria-label': string }
    | { title?: undefined; 'aria-labelledby': string }
  );

/** True when a file matches a native `accept` list (".pdf", "image/*", "image/png"). */
function matchesAccept(file: File, accept: string | undefined) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) =>
      token.startsWith('.') ? name.endsWith(token) : token.endsWith('/*') ? type.startsWith(token.slice(0, -1)) : type === token,
    );
}

const defaultAnnouncements: Required<FileUploadAnnouncements> = {
  added: (names) => `Added ${names.join(', ')}`,
  success: (name) => `${name} uploaded`,
  danger: (name) => `${name} failed to upload`,
};

/** Figma breaks the line after "or". */
const defaultInstruction = (
  <>
    Drag and drop files here or
    <br />
    click to upload
  </>
);

const defaultRemoveLabel =(file: FileUploadFile) =>
  file.status === 'uploading' ? `Cancel upload of ${file.name}` : `Remove ${file.name}`;

/** A drop zone people click or drop files on, with the list of added files. Figma: File Upload page, set "File-upload". */
export function FileUpload({
  title,
  description,
  fileTypes,
  instruction = defaultInstruction,
  accept,
  multiple,
  name,
  disabled,
  onFilesAdd,
  onFilesReject,
  files = [],
  onRemove,
  removeLabel = defaultRemoveLabel,
  filesLabel = 'Files',
  announcements,
  inputProps,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ...rest
}: FileUploadProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const typesId = `${id}-types`;
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState('');
  const { visuallyHiddenProps } = useVisuallyHidden();
  const say = { ...defaultAnnouncements, ...announcements };

  // Announce rows that turn success or danger, once per change.
  const statuses = useRef(new Map<string, FileUploadStatus>());
  useEffect(() => {
    const seen = statuses.current;
    const next = new Map<string, FileUploadStatus>();
    let sentence = '';
    for (const file of files) {
      const status = file.status ?? 'uploaded';
      next.set(file.id, status);
      const before = seen.get(file.id);
      if (before !== undefined && before !== status && (status === 'success' || status === 'danger')) {
        sentence = say[status](file.name);
      }
    }
    statuses.current = next;
    if (sentence) setMessage(sentence);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const add = (list: File[]) => {
    if (list.length === 0) return;
    onFilesAdd?.(list);
    setMessage(say.added(list.map((f) => f.name)));
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    inputProps?.onChange?.(event);
    add(Array.from(event.currentTarget.files ?? []));
    if (name == null) event.currentTarget.value = '';
  };

  const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes('Files');

  const onDragEnter = (event: DragEvent<HTMLLabelElement>) => {
    if (disabled || !hasFiles(event)) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragOver(true);
  };

  const onDragOver = (event: DragEvent<HTMLLabelElement>) => {
    if (disabled || !hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const onDragLeave = () => {
    if (disabled) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragOver(false);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragOver(false);
    const dropped = Array.from(event.dataTransfer.files);
    const accepted = dropped.filter((file) => matchesAccept(file, accept));
    const rejected = dropped.filter((file) => !matchesAccept(file, accept));
    const kept = multiple ? accepted : accepted.slice(0, 1);
    if (rejected.length) onFilesReject?.(rejected);
    // Hand the dropped files to the input too, so a form submit carries them.
    if (name != null && inputRef.current && kept.length) {
      try {
        const transfer = new DataTransfer();
        kept.forEach((file) => transfer.items.add(file));
        inputRef.current.files = transfer.files;
      } catch {
        // Older browsers can't build a FileList; onFilesAdd still has the files.
      }
    }
    add(kept);
  };

  const describedBy =
    [ariaDescribedby, description != null ? descriptionId : null, fileTypes != null ? typesId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div {...rest} className={`bland-file-upload${className ? ` ${className}` : ''}`} data-disabled={disabled || undefined}>
      {(title != null || description != null) && (
        <div className="bland-file-upload__header">
          {title != null && (
            <span id={titleId} className="bland-file-upload__title">
              {title}
            </span>
          )}
          {description != null && (
            <span id={descriptionId} className="bland-file-upload__description">
              {description}
            </span>
          )}
        </div>
      )}

      <label
        className="bland-file-upload__dropzone bland-focus-ring bland-smooth"
        data-drag-over={dragOver || undefined}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          {...inputProps}
          {...visuallyHiddenProps}
          ref={inputRef}
          type="file"
          className="bland-file-upload__input"
          accept={accept}
          multiple={multiple}
          name={name}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={title != null ? titleId : ariaLabelledby}
          aria-describedby={describedBy}
          onChange={onChange}
        />
        <span className="bland-file-upload__disc">
          <Icon>
            <CloudArrowUpIcon />
          </Icon>
        </span>
        <span className="bland-file-upload__instruction">{instruction}</span>
        {fileTypes != null && (
          <span id={typesId} className="bland-file-upload__types">
            {fileTypes}
          </span>
        )}
      </label>

      {!disabled && files.length > 0 && (
        <ul className="bland-file-upload__files" aria-label={filesLabel}>
          {files.map((file) => (
            <FileRow key={file.id} file={file} onRemove={onRemove} removeLabel={removeLabel} />
          ))}
        </ul>
      )}

      <span {...visuallyHiddenProps} role="status">
        {message}
      </span>
    </div>
  );
}

/** One file, with its icon, name, description, progress and close button. */
function FileRow({
  file,
  onRemove,
  removeLabel,
}: {
  file: FileUploadFile;
  onRemove?: (id: string) => void;
  removeLabel: (file: FileUploadFile) => string;
}) {
  const nameId = useId();
  const status = file.status ?? 'uploaded';
  const closable = status !== 'success' && onRemove != null;

  return (
    <li className="bland-file-upload__file bland-smooth" data-status={status}>
      <span className="bland-file-upload__file-icon">
        <Icon>{status === 'danger' ? <WarningOctagonIcon /> : <FileArrowUpIcon />}</Icon>
      </span>
      <span className="bland-file-upload__file-content">
        <span className="bland-file-upload__file-text">
          <span id={nameId} className="bland-file-upload__file-name">
            {file.name}
          </span>
          {file.description != null && <span className="bland-file-upload__file-description">{file.description}</span>}
        </span>
        {status === 'uploading' && (
          <ProgressBar className="bland-file-upload__progress" value={file.progress ?? 0} aria-labelledby={nameId} />
        )}
      </span>
      {status === 'success' && (
        <span className="bland-file-upload__file-status">
          <Icon>
            <CheckCircleIcon />
          </Icon>
        </span>
      )}
      {closable && (
        <button
          type="button"
          className="bland-file-upload__close bland-focus-ring"
          aria-label={removeLabel(file)}
          onClick={() => onRemove(file.id)}
        >
          <Icon>
            <XIcon />
          </Icon>
        </button>
      )}
    </li>
  );
}

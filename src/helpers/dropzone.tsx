import { ChangeEvent, ReactElement, useEffect, useRef } from "react";

/**
 * Accessible file drop zone
 * iain eudailey
 * @param {onFileReceived, children}
 * @returns
*/
export const Dropzone = (
  {
    onFileReceived,
    children
  }: {
    onFileReceived: (file: File) => void,
    children?: ReactElement<any, any>
  }
): ReactElement<HTMLFormElement> => {
  const dropForm = useRef<HTMLFormElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const body = document.querySelector('body');

  // setup drop area listeners
  useEffect(() => {
    const dragOverEnter = (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      body?.classList.add('going-through-list');
    }
    const dragLeave = (e: any) => {
      body?.classList.remove('going-through-list');
    }
    const drop = (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      const dt = e.dataTransfer;
      const files = [...dt.files];
      onFileReceived(files[0]);
    }
    let dropbox = dropForm.current;
    dropbox?.addEventListener("dragenter", dragOverEnter, false);
    dropbox?.addEventListener("dragover", dragOverEnter, false);
    dropbox?.addEventListener('dragleave', dragLeave, false);
    dropbox?.addEventListener("drop", drop, false);
  }, [dropForm]);


  /**
   * handles accessible file input
   * @param event
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files?.length) {
      onFileReceived(event.target?.files[0]);
    }
  }

  return (
    <form ref={dropForm}>
      <input id="uploadCSV" className="sr-only" autoFocus ref={fileInput} type='file' onChange={handleChange} />
      {children}
    </form>
  )
}
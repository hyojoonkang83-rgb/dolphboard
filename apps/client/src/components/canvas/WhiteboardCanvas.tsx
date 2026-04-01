import { useCallback, useRef } from 'react';
import {
  Tldraw,
  createShapeId,
  AssetRecordType,
  type TLAsset,
  type Editor,
} from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { useImageUpload } from '../../hooks/useImageUpload.js';

interface WhiteboardCanvasProps {
  boardId: string;
}

export function WhiteboardCanvas({ boardId: _boardId }: WhiteboardCanvasProps) {
  const editorRef = useRef<Editor | null>(null);
  const { upload } = useImageUpload();

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  // Handle external file drops (files dragged from OS onto the canvas)
  const handleExternalDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      if (!editorRef.current) return;

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/'),
      );
      if (files.length === 0) return;

      // Get canvas coordinates from screen position
      const editor = editorRef.current;
      const { x, y } = editor.screenToPage({ x: e.clientX, y: e.clientY });

      for (const file of files) {
        const url = await upload(file);
        if (!url) continue;

        // Create an asset and image shape
        const assetId = AssetRecordType.createId();
        const asset: TLAsset = AssetRecordType.create({
          id: assetId,
          type: 'image',
          typeName: 'asset',
          props: {
            src: url,
            w: 400,
            h: 300,
            name: file.name,
            isAnimated: false,
            mimeType: file.type,
          },
          meta: {},
        });

        editor.createAssets([asset]);

        const shapeId = createShapeId();
        editor.createShape({
          id: shapeId,
          type: 'image',
          x: x - 200,
          y: y - 150,
          props: {
            assetId,
            w: 400,
            h: 300,
          },
        });
      }
    },
    [upload],
  );

  return (
    <div
      className="canvas-container"
      onDragOver={(e) => {
        // Allow drop if it contains files
        if (Array.from(e.dataTransfer.types).includes('Files')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDrop={handleExternalDrop}
    >
      <Tldraw
        onMount={handleMount}
        inferDarkMode
        autoFocus
      />
    </div>
  );
}

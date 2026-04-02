import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Tldraw,
  createShapeId,
  AssetRecordType,
  type TLAsset,
  type TLAssetStore,
  type Editor,
} from '@tldraw/tldraw';
import { useSync } from '@tldraw/sync';
import '@tldraw/tldraw/tldraw.css';
import { api } from '../../lib/api.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { getSessionUserInfo } from '../../lib/userInfo.js';
import { CommentsOverlay } from '../comments/CommentsOverlay.js';
import type { UseCommentsResult } from '../../hooks/useComments.js';

interface DolphboardCanvasProps {
  boardId: string;
  commentMode: boolean;
  onCommentModeOff: () => void;
  commentsApi: UseCommentsResult;
}

const assetStore: TLAssetStore = {
  async upload(_asset, file) {
    const { url } = await api.upload(file);
    return { src: url };
  },
  resolve(asset) {
    return asset.props.src ?? null;
  },
};

export function DolphboardCanvas({ boardId, commentMode, onCommentModeOff, commentsApi }: DolphboardCanvasProps) {
  const editorRef = useRef<Editor | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const { user } = useAuth();
  const userInfo = useMemo(() => {
    const session = getSessionUserInfo();
    return user ? { id: user.id, name: user.name, color: user.color } : session;
  }, [user]);

  const wsUri = useMemo(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/rooms/${boardId}`;
  }, [boardId]);

  const store = useSync({
    uri: wsUri,
    userInfo,
    assets: assetStore,
  });

  const handleMount = useCallback((ed: Editor) => {
    editorRef.current = ed;
    setEditor(ed);
  }, []);

  const handleExternalDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      const ed = editorRef.current;
      if (!ed) return;

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/'),
      );
      if (files.length === 0) return;

      const { x, y } = ed.screenToPage({ x: e.clientX, y: e.clientY });

      for (const file of files) {
        try {
          const { url } = await api.upload(file);

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

          ed.createAssets([asset]);
          ed.createShape({
            id: createShapeId(),
            type: 'image',
            x: x - 200,
            y: y - 150,
            props: { assetId, w: 400, h: 300 },
          });
        } catch (err) {
          console.error(`[DolphboardCanvas] Failed to upload ${file.name}:`, err);
        }
      }
    },
    [],
  );

  if (store.status === 'error') {
    return (
      <div className="canvas-container flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm font-medium text-red-500 mb-1">연결 오류</p>
          <p className="text-xs text-gray-400">서버에 연결할 수 없습니다. 새로고침 해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="canvas-container"
      onDragOver={(e) => {
        if (Array.from(e.dataTransfer.types).includes('Files')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDrop={handleExternalDrop}
    >
      <Tldraw
        store={store}
        onMount={handleMount}
        inferDarkMode
        autoFocus
      />
      <CommentsOverlay
        editor={editor}
        commentMode={commentMode}
        onCommentModeOff={onCommentModeOff}
        commentsApi={commentsApi}
      />
    </div>
  );
}

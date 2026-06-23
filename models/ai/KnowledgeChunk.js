import mongoose from 'mongoose';

const KnowledgeChunkSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeSource', required: true, index: true },
    content: { type: String, required: true },
    chunkIndex: { type: Number, default: 0 },
    tokenEstimate: { type: Number, default: 0 },
    embedding: { type: [Number], select: false },
    metadata: {
      sourceName: String,
      sourceType: String,
      category: String,
      url: String,
    },
  },
  { timestamps: true }
);

KnowledgeChunkSchema.index({ businessId: 1, sourceId: 1, chunkIndex: 1 });
KnowledgeChunkSchema.index({ content: 'text' });

export default mongoose.models.KnowledgeChunk || mongoose.model('KnowledgeChunk', KnowledgeChunkSchema);

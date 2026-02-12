declare module '@/components/PostForm' {
  export interface PostFormProps {
    postId?: number
    onSuccess?: () => void
    onCancel?: () => void
  }

  export default function PostForm(props: PostFormProps): JSX.Element
}

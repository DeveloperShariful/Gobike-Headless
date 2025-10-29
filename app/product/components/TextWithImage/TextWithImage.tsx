//app/product/components/TextWithImage/TextWithImage.tsx

import Image from 'next/image';
import styles from './TextWithImage.module.css';

interface TextWithImageProps {
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
  reverse?: boolean; // Optional prop to reverse the layout
}

export default function TextWithImage({ 
  imageUrl, 
  imageAlt, 
  title, 
  description, 
  reverse = false 
}: TextWithImageProps) {
  
  const containerClasses = `${styles.container} ${reverse ? styles.reverse : ''}`;

  return (
    <div className={containerClasses}>
      <div className={styles.imageColumn}>
        <div className={styles.imageWrapper}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
      <div className={styles.textColumn}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}
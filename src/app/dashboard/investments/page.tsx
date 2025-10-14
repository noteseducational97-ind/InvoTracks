import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const investments = [
    {
        id: '1',
        name: 'Tech Innovators Fund',
        value: '$15,250.50',
        return: '+12.5%',
        isPositive: true,
        type: 'Stocks',
        imageId: 'investment-1'
    },
    {
        id: '2',
        name: 'Downtown Real Estate',
        value: '$25,500.00',
        return: '+8.2%',
        isPositive: true,
        type: 'Real Estate',
        imageId: 'investment-2'
    },
    {
        id: '3',
        name: 'Green Energy Bonds',
        value: '$5,120.75',
        return: '-1.8%',
        isPositive: false,
        type: 'Bonds',
        imageId: 'investment-3'
    },
    {
        id: '4',
        name: 'Emerging Markets ETF',
        value: '$9,360.25',
        return: '+25.7%',
        isPositive: true,
        type: 'ETF',
        imageId: 'hero-image'
    },
]

export default function InvestmentsPage() {
    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Your Investments</h1>
            <p className="text-muted-foreground">Here is a detailed view of your portfolio.</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {investments.map((investment) => {
                    const image = PlaceHolderImages.find(p => p.id === investment.imageId);
                    return (
                        <Card key={investment.id} className="flex flex-col">
                            <CardHeader className="p-0">
                                {image && (
                                    <Image
                                        src={image.imageUrl}
                                        alt={image.description}
                                        data-ai-hint={image.imageHint}
                                        width={400}
                                        height={225}
                                        className="rounded-t-lg object-cover aspect-video"
                                    />
                                )}
                            </CardHeader>
                            <CardContent className="pt-6 flex-1">
                                <Badge variant="outline" className='mb-2'>{investment.type}</Badge>
                                <h3 className="font-headline text-xl font-semibold">{investment.name}</h3>
                                <p className="text-sm text-muted-foreground">Current Value</p>
                                <p className="text-2xl font-bold">{investment.value}</p>
                            </CardContent>
                            <CardFooter>
                                <div className={`flex items-center font-semibold ${investment.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {investment.isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                                    {investment.return}
                                    <span className='text-muted-foreground font-normal ml-1 text-xs'>(All Time)</span>
                                </div>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}
